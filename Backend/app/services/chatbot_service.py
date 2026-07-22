from app.extensions import db

from app.models.bank_account import BankAccount
from app.models.transaction import Transaction
from app.models.credit_score import CreditScore
from app.models.user import User
from app.models.uploaded_statement import UploadedStatement

from app.ai.credit_score_prediction import CreditScorePrediction
from app.ai.ai_banking_assistant import AIBankingAssistant





class ChatbotService:

    @staticmethod
    def chat(user_id, question):

        if not user_id:
            raise ValueError("User ID is required.")

        if not question:
            raise ValueError("Question is required.")

        customer = User.query.get(user_id)

        if not customer:
            raise ValueError("User not found.")

        accounts = BankAccount.query.filter_by(
            user_id=user_id
        ).all()

        transactions = []

        if accounts:
            account_ids = [
                account.id
                for account in accounts
            ]

            transactions = Transaction.query.filter(
                Transaction.sender_account_id.in_(account_ids)
            ).all()

        statements = UploadedStatement.query.join(
            BankAccount
        ).filter(
            BankAccount.user_id == user_id
        ).all()

        return AIBankingAssistant.ask_ai(
            user_id,
            customer,
            question,
            accounts,
            transactions,
            statements=statements
        )

    @staticmethod
    def health():
        return AIBankingAssistant.health()