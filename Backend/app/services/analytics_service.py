from sqlalchemy import func

from app.models.bank_account import BankAccount
from app.models.transaction import Transaction
from app.models.uploaded_statement import UploadedStatement


class AnalyticsService:

    # ==========================================
    # Customer Analytics
    # ==========================================

    @staticmethod
    def customer_analytics(user_id):

        try:

            accounts = (
                BankAccount.query
                .filter_by(user_id=user_id)
                .all()
            )

            account_ids = [account.id for account in accounts]

            transactions = (
                Transaction.query
                .filter(
                    Transaction.sender_account_id.in_(account_ids)
                )
                .all()
            )

            total_spending = sum(
                float(transaction.amount)
                for transaction in transactions
            )

            total_transactions = len(transactions)

            average_transaction = (
                total_spending / total_transactions
                if total_transactions
                else 0
            )

            fraud_transactions = sum(
                1
                for transaction in transactions
                if transaction.fraud_status in [
                    "High Risk",
                    "Blocked"
                ]
            )

            return True, {

                "total_spending": total_spending,

                "total_transactions": total_transactions,

                "average_transaction": average_transaction,

                "fraud_transactions": fraud_transactions

            }

        except Exception as e:

            return False, str(e)

    # ==========================================
    # Employee Analytics
    # ==========================================

    @staticmethod
    def employee_analytics():

        try:

            return True, {

                "total_customers":
                    BankAccount.query.count(),

                "total_transactions":
                    Transaction.query.count(),

                "total_statements":
                    UploadedStatement.query.count(),

                "fraud_cases":
                    Transaction.query.filter(
                        Transaction.fraud_status.in_(
                            [
                                "High Risk",
                                "Blocked"
                            ]
                        )
                    ).count()

            }

        except Exception as e:

            return False, str(e)