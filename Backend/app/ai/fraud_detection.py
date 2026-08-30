import os
import json
import joblib
import numpy as np
import pandas as pd

from decimal import Decimal
from rapidfuzz import process

from app.ai.ai_fraud_analyzer import AIFraudAnalyzer
from app.extensions import db
from app.models.credit_score import CreditScore


# ==========================================================
# Load Fraud Detection ML Model (XGBoost)
# ==========================================================

BASE_DIR = os.path.dirname(__file__)

try:
    MODEL = joblib.load(
        os.path.join(BASE_DIR, "fraud_detection_model.pkl")
    )
    LABEL_ENCODERS = joblib.load(
        os.path.join(BASE_DIR, "fraud_label_encoders.pkl")
    )
    FEATURE_COLUMNS = joblib.load(
        os.path.join(BASE_DIR, "fraud_feature_columns.pkl")
    )
    print("OK: Fraud Detection ML Model loaded successfully.")

except Exception as e:
    print(
        f"WARNING: Failed to load Fraud Detection ML Model: {e}. "
        "Falling back to Rule-Based Fraud Detection only."
    )
    MODEL = None
    LABEL_ENCODERS = None
    FEATURE_COLUMNS = None


# Weights for hybrid scoring
RULE_WEIGHT = 0.55
ML_WEIGHT   = 0.45


def fuzzy_encode(value, encoder, threshold=70):
    """
    Encode a categorical string using fuzzy matching against the encoder's classes.
    Returns -1 if no match found above the threshold.
    """
    value = str(value).strip()
    classes = list(encoder.classes_)
    match = process.extractOne(value, classes)
    if match is None:
        return -1
    matched_value, score = match[0], match[1]
    if score < threshold:
        return -1
    return int(encoder.transform([matched_value])[0])


class FraudDetector:
    """
    Hybrid Fraud Detection Agent

    Combines:
    1. XGBoost ML Model (trained on fraud_detection_dataset.csv)
    2. Rule-based scoring engine
    3. Gemini LLM analysis

    Returns a comprehensive fraud_report dict.
    """

    # ──────────────────────────────────────────────────────
    # ML Prediction
    # ──────────────────────────────────────────────────────

    @staticmethod
    def build_ml_features(transaction, account, monitoring: dict) -> dict:
        """Build the feature dict expected by the XGBoost model."""
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
                transaction.receiver_name or "Unknown",

            "Merchant_Category":
                monitoring.get("merchant_category", "Others"),

            "Location":
                monitoring.get("location", "Unknown"),

            "Device_Type":
                monitoring.get("device_type", "Mobile"),

            "Current_Balance":
                float(transaction.available_balance_before),

            "Monthly_Income":
                monitoring.get("monthly_income", 0),

            "Average_Transaction_Amount":
                monitoring.get("average_transaction_amount", 0),

            "Transaction_Frequency":
                monitoring.get("transaction_frequency", 0),

            "Failed_Transactions":
                monitoring.get("failed_transactions", 0),

            "Credit_Utilization":
                monitoring.get("credit_utilization", 0),

            "Outstanding_Debt":
                monitoring.get("outstanding_debt", 0),
        }

    @staticmethod
    def predict_ml(transaction, account, monitoring: dict) -> dict:
        """
        Run XGBoost inference.
        Returns probability values (0–100) or zeros if model not loaded.
        """
        if MODEL is None or LABEL_ENCODERS is None or FEATURE_COLUMNS is None:
            return {
                "prediction": 0,
                "ml_fraud_probability": 0.0,
                "ml_genuine_probability": 100.0,
                "model_used": False
            }

        data = FraudDetector.build_ml_features(transaction, account, monitoring)
        df   = pd.DataFrame([data])

        categorical_columns = [
            "Transaction_Date",
            "Transaction_Time",
            "Transaction_Type",
            "Payment_Method",
            "Merchant_Category",
            "Merchant_Name",
            "Location",
            "Device_Type",
        ]

        for col in categorical_columns:
            if col in LABEL_ENCODERS:
                df[col] = fuzzy_encode(df.at[0, col], LABEL_ENCODERS[col])
            else:
                df[col] = -1

        # Align column order to training schema
        df = df[FEATURE_COLUMNS]

        prediction    = MODEL.predict(df)[0]
        probabilities = MODEL.predict_proba(df)[0]

        return {
            "prediction":             int(prediction),
            "ml_fraud_probability":   float(probabilities[1] * 100),
            "ml_genuine_probability": float(probabilities[0] * 100),
            "model_used":             True
        }

    # ──────────────────────────────────────────────────────
    # Rule-Based Scoring
    # ──────────────────────────────────────────────────────

    @staticmethod
    def rule_based_score(transaction, account, monitoring: dict, credit) -> tuple:
        """
        Apply deterministic fraud rules on top of the monitoring risk_score.
        Returns (final_rule_score, reasons_list).
        """
        score   = monitoring.get("risk_score", 0)
        reasons = list(monitoring.get("reasons", []))

        amt = Decimal(str(transaction.amount))
        bal_before = Decimal(str(transaction.available_balance_before))
        bal_after = Decimal(str(transaction.available_balance_after))

        # High absolute amount
        if amt >= Decimal("100000"):
            score += 20
            reasons.append("Transaction at or near the ₹1,00,000 maximum limit.")

        # >90% balance used
        if (
            bal_before > 0
            and (amt / bal_before) >= Decimal("0.90")
        ):
            score += 20
            reasons.append("More than 90% of account balance transferred in one go.")

        # Very low remaining balance
        if bal_after < Decimal("500"):
            score += 10
            reasons.append("Balance drops below ₹500 after this transaction.")

        # Unusually large vs customer average
        avg = monitoring.get("average_transaction_amount", 0)
        if avg > 0 and float(transaction.amount) >= avg * 3:
            score += 15
            reasons.append(
                f"Amount (₹{float(transaction.amount):,.0f}) is 3× the customer's"
                f" 90-day average (₹{avg:,.0f})."
            )

        # Multiple failed transactions
        if monitoring.get("failed_transactions", 0) >= 3:
            score += 15
            reasons.append("3 or more failed transactions in the past 30 days.")

        # High transaction frequency
        if monitoring.get("transaction_frequency", 0) >= 15:
            score += 10
            reasons.append("15+ transactions in the past 30 days — unusually high.")

        # Credit score intelligence
        if credit:
            if credit.credit_score < 600:
                score += 20
                reasons.append(f"Low credit score ({credit.credit_score}) increases risk.")
            elif credit.credit_score < 700:
                score += 10
                reasons.append(f"Below-average credit score ({credit.credit_score}).")

        return score, reasons

    # ──────────────────────────────────────────────────────
    # Main Analysis Entry Point
    # ──────────────────────────────────────────────────────

    @staticmethod
    def analyze(transaction, account, monitoring: dict) -> dict:
        """
        Full hybrid fraud analysis:
        1. ML prediction
        2. Rule-based scoring
        3. Weighted hybrid score → fraud status
        4. LLM explanation
        5. Persist results on transaction record

        Returns the complete fraud_report dict.
        """

        # 1. Fetch credit profile
        credit = CreditScore.query.filter_by(
            customer_id=account.user_id,
            is_latest=True
        ).first()

        # 2. ML prediction
        ml_result       = FraudDetector.predict_ml(transaction, account, monitoring)
        ml_probability  = ml_result["ml_fraud_probability"]

        # 3. Rule-based scoring
        rule_score, reasons = FraudDetector.rule_based_score(
            transaction, account, monitoring, credit
        )

        # 4. Hybrid final score (weighted combination)
        final_score = (rule_score * RULE_WEIGHT) + (ml_probability * ML_WEIGHT)

        # 5. Determine fraud status and recommendation
        if final_score >= 80:
            fraud_status   = "Blocked"
            recommendation = "Block the transaction immediately and perform manual verification."
        elif final_score >= 60:
            fraud_status   = "High Risk"
            recommendation = "Flag for manual review before releasing funds."
        elif final_score >= 35:
            fraud_status   = "Medium Risk"
            recommendation = "Monitor closely; notify the customer to confirm."
        else:
            fraud_status   = "Low Risk"
            recommendation = "Transaction appears legitimate. Proceed normally."

        # Cap probability at 100
        fraud_probability = min(100.0, max(ml_probability, final_score))

        # Build intermediate fraud_result for the LLM
        fraud_result_for_llm = {
            "ml_probability":  ml_probability,
            "rule_score":      rule_score,
            "final_score":     final_score,
            "fraud_status":    fraud_status,
            "reasons":         reasons
        }

        # 6. LLM analysis (Gemini)
        ai_analysis = AIFraudAnalyzer.analyze(
            transaction,
            account,
            monitoring,
            fraud_result_for_llm,
            credit
        )

        # 7. Stage AI results on the transaction object (DO NOT commit here).
        #    The service layer owns the single atomic commit after all analysis
        #    is complete. Committing here would make the balance deduction
        #    permanent even if a later exception triggers a rollback.
        transaction.ai_reviewed       = True
        transaction.ai_explanation    = json.dumps(ai_analysis)  # stored as valid JSON
        transaction.fraud_probability = fraud_probability
        transaction.fraud_status      = fraud_status
        transaction.risk_score        = final_score
        transaction.is_flagged        = (fraud_status not in ("Low Risk",))

        # 8. Return complete fraud_report
        return {
            # Scores
            "ml_probability":   round(ml_probability, 2),
            "rule_score":       round(rule_score, 2),
            "final_score":      round(final_score, 2),
            "fraud_probability": round(fraud_probability, 2),

            # Classification
            "fraud_status":    fraud_status,
            "is_flagged":      transaction.is_flagged,
            "recommendation":  recommendation,

            # Rule violations
            "reasons":         reasons,

            # ML meta
            "model_used":      ml_result.get("model_used", False),

            # LLM analysis (structured dict)
            "ai_analysis":     ai_analysis,
        }