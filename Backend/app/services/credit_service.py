from app.extensions import db
from app.models.user import User
from app.models.bank_account import BankAccount
from app.models.transaction import Transaction
from app.models.credit_score import CreditScore
from app.ai.credit_score_prediction import CreditScorePrediction


class CreditService:

    @staticmethod
    def predict_credit_score(user_id, payload=None):

        # Fetch user profile
        user = User.query.get(user_id)

        # Get Accounts
        accounts = BankAccount.query.filter_by(
            user_id=user_id
        ).all()

        if not accounts:
            raise Exception("No bank accounts found.")

        account_ids = [account.id for account in accounts]

        # Get Transactions
        transactions = Transaction.query.filter(
            Transaction.sender_account_id.in_(account_ids)
        ).all()

        # Predict Score using ML Model / Rule Engine
        result = CreditScorePrediction.predict(
            accounts,
            transactions,
            user=user,
            payload=payload
        )

        # Remove Previous Latest Record
        CreditScore.query.filter_by(
            customer_id=user_id,
            is_latest=True
        ).update({"is_latest": False})

        # Save Prediction into DB so other AI services (Fraud Detection, Loan Recommendation, Assistant) use it
        credit = CreditScore(
            customer_id=user_id,
            credit_score=result["credit_score"],
            risk_category=result["risk_category"],
            confidence_score=result["confidence_score"],
            financial_health=result["financial_health"],
            ai_explanation=result["ai_explanation"],
            recommendations="\n".join(result["recommendations"]),
            is_latest=True
        )

        db.session.add(credit)
        db.session.commit()

        # Format clean output dictionary
        return {
            "credit_score": result["credit_score"],
            "predicted_credit_score": result["predicted_credit_score"],
            "lower_bound": result["lower_bound"],
            "upper_bound": result["upper_bound"],
            "credit_score_category": result["credit_score_category"],
            "risk_category": result["risk_category"].value if hasattr(result["risk_category"], "value") else str(result["risk_category"]),
            "financial_health": result["financial_health"],
            "confidence_score": result["confidence_score"],
            "ai_explanation": result["ai_explanation"],
            "recommendations": result["recommendations"],
            "reasons": result["reasons"],
            "uncertainty_margin": result["uncertainty_margin"],
            "model_used": result["model_used"]
        }