import os
import joblib
import pandas as pd
from decimal import Decimal

from app.models.credit_score import RiskCategory


# ==========================================================
# Load ML Credit Model Artifact ONCE at module load time
# ==========================================================

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.abspath(
    os.path.join(BASE_DIR, "..", "..", "credit_model", "credit_score_model.joblib")
)

ARTIFACT = None
PIPELINE = None
RAW_INPUT_COLUMNS = []
CATEGORY_CONFIG = {}
UNCERTAINTY_MARGIN = 15.0
ML_MODEL_LOADED = False

try:
    if os.path.exists(MODEL_PATH):
        ARTIFACT = joblib.load(MODEL_PATH)
        PIPELINE = ARTIFACT.get("pipeline")
        RAW_INPUT_COLUMNS = ARTIFACT.get("raw_input_columns", [])
        CATEGORY_CONFIG = ARTIFACT.get("category_config", {})
        UNCERTAINTY_MARGIN = float(ARTIFACT.get("uncertainty_margin", 15.0))
        ML_MODEL_LOADED = True
        print("OK: Credit Score ML Model (joblib) loaded successfully.")
    else:
        print(f"WARNING: Credit score model file not found at {MODEL_PATH}")
except Exception as e:
    print(f"WARNING: Could not load Credit Score ML model artifact: {e}")
    ML_MODEL_LOADED = False


def credit_score_to_category(score, config=CATEGORY_CONFIG):
    if not config:
        if score >= 800:
            return "Excellent"
        elif score >= 740:
            return "Very Good"
        elif score >= 670:
            return "Good"
        elif score >= 580:
            return "Fair"
        else:
            return "Poor"

    for label, (low, high) in config.items():
        if low <= score <= high:
            return label
    if score < min(v[0] for v in config.values()):
        return list(config.keys())[0]
    return list(config.keys())[-1]


def engineer_features(X):
    X = X.copy()
    eps = 1.0
    annual_income = X["Monthly_Income"] * 12
    X["Debt_to_Income_Ratio"] = X["Outstanding_Debt"] / (annual_income + eps)
    X["Total_Debt_to_Asset_Ratio"] = (X["Existing_Debt"] + X["Outstanding_Debt"]) / (
        X["Current_Balance"] + X["Investment_Value"] + X["Insurance_Value"] + eps
    )
    X["Investment_to_Income_Ratio"] = X["Investment_Value"] / (annual_income + eps)
    X["Liquidity_Ratio"] = X["Current_Balance"] / (X["Monthly_Expenses"] + eps)
    X["Debt_Burden_Ratio"] = (X["Existing_Debt"] + X["Outstanding_Debt"]) / (annual_income + eps)
    return X


class CreditScorePrediction:

    MIN_SCORE = 300
    MAX_SCORE = 900
    BASE_SCORE = 650

    @staticmethod
    def predict(accounts, transactions, user=None, payload=None):
        payload = payload or {}

        # ── Calculate basic metrics from accounts & transactions ────────
        total_balance = float(sum(Decimal(account.current_balance) for account in accounts) if accounts else 0.0)

        income = 0.0
        expenses = 0.0
        for tx in transactions:
            amt = float(tx.amount)
            if getattr(tx.transaction_type, "value", str(tx.transaction_type)) == "Credit":
                income += amt
            else:
                expenses += amt

        monthly_income = float(payload.get("Monthly_Income", max(income, 50000.0)))
        monthly_expenses = float(payload.get("Monthly_Expenses", max(expenses, 20000.0)))
        monthly_savings = monthly_income - monthly_expenses
        annual_income = monthly_income * 12.0

        existing_debt = float(payload.get("Existing_Debt", 0.0))
        investment_val = float(payload.get("Investment_Value", 0.0))
        insurance_val = float(payload.get("Insurance_Value", 0.0))
        outstanding_debt = float(payload.get("Outstanding_Debt", max(0.0, expenses - income)))
        failed_txns = sum(1 for tx in transactions if getattr(tx.transaction_status, "value", str(tx.transaction_status)) == "Failed")
        risky_txns = sum(1 for tx in transactions if getattr(tx, "is_flagged", False))

        reasons = []
        recommendations = []

        if total_balance >= 200000:
            reasons.append("Excellent account balance maintained.")
        elif total_balance >= 100000:
            reasons.append("Healthy account balance.")
        elif total_balance >= 50000:
            reasons.append("Good account balance.")
        else:
            reasons.append("Low account balance.")

        if monthly_savings >= 50000:
            reasons.append("Strong monthly savings pattern.")
        elif monthly_savings >= 20000:
            reasons.append("Healthy monthly savings.")
        else:
            reasons.append("Low monthly savings.")

        if failed_txns > 0:
            reasons.append(f"{failed_txns} failed transaction(s) detected.")
            recommendations.append("Avoid failed banking transactions.")

        if risky_txns > 0:
            reasons.append(f"{risky_txns} suspicious transaction(s) flagged.")
            recommendations.append("Review flagged transaction activity.")

        if monthly_savings < 10000:
            recommendations.append("Increase your monthly savings ratio.")

        if total_balance < 50000:
            recommendations.append("Maintain a higher average account balance.")

        if not recommendations:
            recommendations.append("Maintain your current strong financial habits.")

        # ── ML Model Prediction Execution ─────────────────────────────
        ml_used = False
        predicted_score = None
        category_label = "Good"

        if ML_MODEL_LOADED and PIPELINE is not None and RAW_INPUT_COLUMNS:
            try:
                # Build raw feature row expected by ML Pipeline
                feature_row = {
                    "Age": float(payload.get("Age", 32)),
                    "Gender": str(payload.get("Gender", "Male")),
                    "Education": str(payload.get("Education", "Graduate")),
                    "Employment_Status": str(payload.get("Employment_Status", "Salaried")),
                    "Occupation": str(payload.get("Occupation", "Professional")),
                    "Monthly_Income": monthly_income,
                    "Monthly_Expenses": monthly_expenses,
                    "Monthly_Savings": monthly_savings,
                    "Annual_Income": annual_income,
                    "Current_Balance": total_balance,
                    "Existing_Debt": existing_debt,
                    "Investment_Value": investment_val,
                    "Insurance_Value": insurance_val,
                    "Credit_Utilization": float(payload.get("Credit_Utilization", min(100.0, (outstanding_debt / (monthly_income + 1.0)) * 100))),
                    "Credit_History_Years": float(payload.get("Credit_History_Years", 5.0)),
                    "Outstanding_Debt": outstanding_debt,
                    "Credit_Cards": int(payload.get("Credit_Cards", 2)),
                    "Credit_Inquiries": int(payload.get("Credit_Inquiries", 1)),
                    "Payment_History": str(payload.get("Payment_History", "Good")),
                    "Credit_Mix": str(payload.get("Credit_Mix", "Good")),
                    "Failed_Transactions": int(payload.get("Failed_Transactions", failed_txns)),
                    "Savings_Ratio": float(payload.get("Savings_Ratio", max(0.0, monthly_savings / (monthly_income + 1.0)))),
                    "Expense_Ratio": float(payload.get("Expense_Ratio", min(1.0, monthly_expenses / (monthly_income + 1.0)))),
                    "Income_Stability": str(payload.get("Income_Stability", "Stable")),
                    "Financial_Health_Score": float(payload.get("Financial_Health_Score", 75.0)),
                }

                input_df = pd.DataFrame([feature_row])[RAW_INPUT_COLUMNS]
                engineered_input = engineer_features(input_df)
                raw_pred = float(PIPELINE.predict(engineered_input)[0])
                predicted_score = round(max(float(CreditScorePrediction.MIN_SCORE), min(float(CreditScorePrediction.MAX_SCORE), raw_pred)), 2)
                category_label = credit_score_to_category(predicted_score)
                ml_used = True
            except Exception as ml_err:
                print(f"WARNING: Exception during ML prediction, falling back to rule engine: {ml_err}")
                ml_used = False

        if not ml_used:
            # Fallback Rule Engine
            score = CreditScorePrediction.BASE_SCORE
            if total_balance >= 200000: score += 80
            elif total_balance >= 100000: score += 50
            elif total_balance >= 50000: score += 25
            else: score -= 20

            if monthly_savings >= 50000: score += 60
            elif monthly_savings >= 20000: score += 40
            elif monthly_savings >= 5000: score += 20
            else: score -= 20

            score -= failed_txns * 10
            score -= risky_txns * 15
            predicted_score = float(max(CreditScorePrediction.MIN_SCORE, min(CreditScorePrediction.MAX_SCORE, score)))
            category_label = credit_score_to_category(predicted_score)

        lower_bound = round(predicted_score - UNCERTAINTY_MARGIN, 2)
        upper_bound = round(predicted_score + UNCERTAINTY_MARGIN, 2)

        # Map string category to RiskCategory Enum
        cat_upper = category_label.upper().replace(" ", "_")
        category_enum_map = {
            "POOR": RiskCategory.POOR,
            "FAIR": RiskCategory.FAIR,
            "GOOD": RiskCategory.GOOD,
            "VERY_GOOD": RiskCategory.VERY_GOOD,
            "EXCELLENT": RiskCategory.EXCELLENT,
        }
        risk_category_enum = category_enum_map.get(cat_upper, RiskCategory.GOOD)

        if predicted_score >= 780:
            health = "Excellent"
        elif predicted_score >= 700:
            health = "Good"
        elif predicted_score >= 620:
            health = "Average"
        else:
            health = "Needs Improvement"

        model_type = "Machine Learning Pipeline (CatBoost Regressor)" if ml_used else "Rule-based Predictive Engine"
        explanation = (
            f"Your credit score is predicted at {predicted_score} ({category_label}) using our {model_type}. "
            f"The estimated score ranges between {lower_bound} and {upper_bound} (uncertainty margin: ±{UNCERTAINTY_MARGIN}). "
            f"Analysis is based on your balance (₹{total_balance:,.2f}), monthly income (₹{monthly_income:,.2f}), "
            f"savings behavior, and historical transaction patterns."
        )

        return {
            "credit_score": int(round(predicted_score)),
            "predicted_credit_score": predicted_score,
            "lower_bound": lower_bound,
            "upper_bound": upper_bound,
            "credit_score_category": category_label,
            "uncertainty_margin": UNCERTAINTY_MARGIN,
            "risk_category": risk_category_enum,
            "financial_health": health,
            "confidence_score": 95.0,
            "ai_explanation": explanation,
            "recommendations": recommendations,
            "reasons": reasons,
            "model_used": "ML Pipeline" if ml_used else "Rule Engine"
        }