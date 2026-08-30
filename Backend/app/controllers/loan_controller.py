from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.models.bank_account import BankAccount
from app.models.transaction import Transaction
from app.models.credit_score import CreditScore
from app.ai.loan_recommender import AILoanRecommender
from app.utils.response import success_response, error_response


class LoanController:

    @staticmethod
    @jwt_required()
    def recommend():
        try:
            user_id = get_jwt_identity()
            json_payload = request.get_json(silent=True) or {}

            user = User.query.get(user_id)
            if not user:
                return error_response("User not found.", 404)

            accounts = BankAccount.query.filter_by(user_id=user_id).all()
            if not accounts:
                return error_response("No bank accounts linked. Please link a bank account first.", 400)

            account_ids = [acc.id for acc in accounts]
            transactions = Transaction.query.filter(Transaction.sender_account_id.in_(account_ids)).all()
            credit = CreditScore.query.filter_by(customer_id=user_id, is_latest=True).first()

            result = AILoanRecommender.recommend(
                user,
                accounts,
                transactions,
                credit,
                json_payload
            )

            return success_response(
                "Loan recommendations retrieved successfully.",
                result,
                200
            )

        except Exception as e:
            return error_response(str(e), 500)

    @staticmethod
    @jwt_required()
    def chat():
        try:
            json_payload = request.get_json(silent=True) or {}
            message = json_payload.get("message")
            context_data = json_payload.get("context_data")
            chat_history = json_payload.get("chat_history")

            if not message or not context_data:
                return error_response("Missing message or context data.", 400)

            answer = AILoanRecommender.chat(
                message,
                context_data,
                chat_history
            )

            return success_response(
                "Loan chatbot response generated.",
                {"answer": answer},
                200
            )

        except Exception as e:
            return error_response(str(e), 500)
