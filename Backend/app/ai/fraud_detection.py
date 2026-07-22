import os
import joblib
import numpy as np
import pandas as pd

from decimal import Decimal
from rapidfuzz import process

from app.ai.ai_fraud_analyzer import AIFraudAnalyzer
from app.extensions import db
from app.models.credit_score import CreditScore


# ==========================================================
# Load Fraud Detection ML Model
# ==========================================================

BASE_DIR = os.path.dirname(__file__)

MODEL = joblib.load(
    os.path.join(BASE_DIR, "fraud_detection_model.pkl")
)

LABEL_ENCODERS = joblib.load(
    os.path.join(BASE_DIR, "fraud_label_encoders.pkl")
)

FEATURE_COLUMNS = joblib.load(
    os.path.join(BASE_DIR, "fraud_feature_columns.pkl")
)

RULE_WEIGHT = 0.60
ML_WEIGHT = 0.40


def fuzzy_encode(value, encoder, threshold=70):
    """
    Encode categorical values using fuzzy matching.
    Returns -1 if no reasonable match is found.
    """

    value = str(value).strip()

    classes = list(encoder.classes_)

    match = process.extractOne(value, classes)

    if match is None:
        return -1

    matched_value = match[0]
    score = match[1]

    if score < threshold:
        return -1

    return int(encoder.transform([matched_value])[0])


class FraudDetector:

    # ==========================================
    # Fraud Detection
    # ==========================================

    @staticmethod
    def build_features(transaction, account, monitoring):

        return {
            "Transaction_Date":
                transaction.created_at.strftime("%Y-%m-%d"),

            "Transaction_Time":
                transaction.created_at.strftime("%H:%M:%S"),

            "Transaction_Amount":
                float(transaction.amount),

            "Transaction_Type":
                transaction.transaction_type.value,

            "Payment_Method":
                transaction.transaction_source.value,

            "Merchant_Name":
                transaction.receiver_name,

            "Merchant_Category":
                monitoring.get(
                    "merchant_category",
                    "Others"
                ),

            "Location":
                monitoring.get(
                    "location",
                    account.user.address
                ),

            "Device_Type":
                monitoring.get(
                    "device_type",
                    "Mobile"
                ),

            "Current_Balance":
                float(transaction.available_balance_before),

            "Monthly_Income":
                monitoring.get(
                    "monthly_income",
                    0
                ),

            "Average_Transaction_Amount":
                monitoring.get(
                    "average_transaction_amount",
                    0
                ),

            "Transaction_Frequency":
                monitoring.get(
                    "transaction_frequency",
                    0
                ),

            "Failed_Transactions":
                monitoring.get(
                    "failed_transactions",
                    0
                ),

            "Credit_Utilization":
                monitoring.get(
                    "credit_utilization",
                    0
                ),

            "Outstanding_Debt":
                monitoring.get(
                    "outstanding_debt",
                    0
                )
        }

    @staticmethod
    def predict_ml(transaction, account, monitoring):

        """
        Predict Fraud Probability using XGBoost
        """

        data = FraudDetector.build_features(
            transaction,
            account,
            monitoring
        )

        df = pd.DataFrame([data])

        # ==========================================================
        # Encode Categorical Features
        # ==========================================================

        categorical_columns = [
            "Transaction_Date",
            "Transaction_Time",
            "Transaction_Type",
            "Payment_Method",
            "Merchant_Category",
            "Merchant_Name",
            "Location",
            "Device_Type"
        ]

        for column in categorical_columns:

            df[column] = fuzzy_encode(
                df.at[0, column],
                LABEL_ENCODERS[column]
            )

        # ==========================================================
        # Arrange Columns
        # ==========================================================

        df = df[FEATURE_COLUMNS]

        # ==========================================================
        # ML Prediction
        # ==========================================================

        prediction = MODEL.predict(df)[0]

        probabilities = MODEL.predict_proba(df)[0]

        return {

            "prediction": int(prediction),

            "fraud_probability": float(probabilities[1] * 100),

            "genuine_probability": float(probabilities[0] * 100)

        }

    @staticmethod
    def analyze(transaction, account, monitoring):

        fraud_score = monitoring["risk_score"]

        # ======================================
        # ML Fraud Prediction
        # ======================================

        ml_result = FraudDetector.predict_ml(
            transaction,
            account,
            monitoring
        )

        ml_probability = ml_result["fraud_probability"]

        reasons = []

        # ======================================
        # High Transaction Amount
        # ======================================

        if transaction.amount >= Decimal("100000"):
            fraud_score += 20
            reasons.append(
                "Very high transaction amount."
            )

        # ======================================
        # Large Percentage of Balance Used
        # ======================================

        if (
            transaction.available_balance_before > 0
            and (
                transaction.amount /
                transaction.available_balance_before
            ) >= Decimal("0.90")
        ):
            fraud_score += 20
            reasons.append(
                "More than 90% of account balance transferred."
            )

        # ======================================
        # Low Remaining Balance
        # ======================================

        if transaction.available_balance_after < Decimal("500"):

            fraud_score += 10

            reasons.append(
                "Very low remaining balance."
            )

        # ======================================
        # Unusually Large Transaction
        # ======================================

        avg_amount = monitoring.get(
            "average_transaction_amount",
            0
        )

        if avg_amount > 0:

            if float(transaction.amount) >= avg_amount * 3:

                fraud_score += 15

                reasons.append(
                    "Transaction amount is much higher than customer's average."
                )

        # ======================================
        # Failed Transactions
        # ======================================

        failed = monitoring.get(
            "failed_transactions",
            0
        )

        if failed >= 3:

            fraud_score += 15

            reasons.append(
                "Multiple failed transactions detected."
            )

        # ======================================
        # Transaction Frequency
        # ======================================

        frequency = monitoring.get(
            "transaction_frequency",
            0
        )

        if frequency >= 15:

            fraud_score += 10

            reasons.append(
                "Very high transaction frequency."
            )

        # ======================================
        # Credit Score Intelligence
        # ======================================

        credit = CreditScore.query.filter_by(
            customer_id=account.user_id,
            is_latest=True
        ).first()

        if credit:

            if credit.credit_score < 600:

                fraud_score += 20

                reasons.append(
                    "Low credit score."
                )

            elif credit.credit_score < 700:

                fraud_score += 10

                reasons.append(
                    "Average credit score."
                )

        # ======================================
        # Final Score Merge
        # ======================================

        rule_score = fraud_score

        final_score = (

            rule_score * RULE_WEIGHT

            +

            ml_probability * ML_WEIGHT

        )

        if final_score >= 80:

            probability = max(
                ml_probability,
                final_score
            )

            status = "Blocked"

        elif final_score >= 60:

            probability = max(
                ml_probability,
                final_score
            )

            status = "High Risk"

        elif final_score >= 40:

            probability = max(
                ml_probability,
                final_score
            )

            status = "Medium Risk"

        else:

            probability = ml_probability

            status = "Low Risk"

        # ======================================
        # AI Recommendation
        # ======================================

        if status == "Blocked":

            recommendation = (
                "Block the transaction and perform manual verification."
            )

        elif status == "High Risk":

            recommendation = (
                "Manual review is recommended."
            )

        elif status == "Medium Risk":

            recommendation = (
                "Monitor this transaction closely."
            )

        else:

            recommendation = (
                "Transaction appears to be safe."
            )

        fraud_result = {

            "fraud_probability": probability,

            "ml_probability": ml_probability,

            "rule_score": rule_score,

            "final_score": final_score,

            "fraud_status": status,

            "reasons": reasons

        }

        credit = CreditScore.query.filter_by(
            customer_id=account.user_id,
            is_latest=True
        ).first()

        ai_explanation = AIFraudAnalyzer.analyze(

            transaction,

            account,

            monitoring,

            fraud_result,

            credit

        )

        transaction.ai_reviewed = True

        transaction.ai_explanation = ai_explanation

        transaction.fraud_probability = probability

        transaction.fraud_status = status

        transaction.risk_score = final_score

        transaction.is_flagged = (
            status != "Low Risk"
        )

        db.session.commit()

        fraud_result["ai_explanation"] = ai_explanation

        return {

            "fraud_probability": probability,

            "ml_probability": ml_probability,

            "rule_score": rule_score,

            "final_score": final_score,

            "fraud_status": status,

            "recommendation": recommendation,

            "reasons": reasons,

            "ai_explanation": ai_explanation

        }