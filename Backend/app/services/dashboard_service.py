from app.models.user import User, UserRole
from app.models.bank_account import BankAccount
from app.models.transaction import Transaction
from app.models.uploaded_statement import UploadedStatement, ProcessingStatus
from app.ai.ai_service import AIService


class DashboardService:

    # ==========================================
    # Customer Dashboard
    # ==========================================

    @staticmethod
    def get_customer_dashboard(user_id):

        try:

            # -------------------------------
            # User
            # -------------------------------

            user = User.query.get(user_id)

            if not user:
                return False, "User not found."

            # -------------------------------
            # Accounts
            # -------------------------------

            accounts = (
                BankAccount.query
                .filter_by(user_id=user_id)
                .all()
            )

            # -------------------------------
            # Transactions
            # -------------------------------

            transactions = (
                Transaction.query
                .join(BankAccount)
                .filter(
                    BankAccount.user_id == user_id
                )
                .order_by(
                    Transaction.created_at.desc()
                )
                .limit(5)
                .all()
            )

            # -------------------------------
            # Statements
            # -------------------------------

            statements = (
                UploadedStatement.query
                .join(BankAccount)
                .filter(
                    BankAccount.user_id == user_id
                )
                .order_by(
                    UploadedStatement.created_at.desc()
                )
                .limit(5)
                .all()
            )

            # -------------------------------
            # AI
            # -------------------------------

            primary_account = (
                accounts[0]
                if accounts
                else None
            )

            credit = {}

            loan = {}

            summary = {}

            if primary_account:

                credit = (
                    AIService.predict_credit_score(
                        primary_account,
                        transactions
                    )
                )

                loan = (
                    AIService.recommend_loan(
                        primary_account,
                        credit
                    )
                )

                latest_transaction = (
                    transactions[0]
                    if transactions
                    else None
                )

                summary = (
                    AIService.generate_banking_summary(
                        primary_account,
                        transactions,
                        latest_transaction
                    )
                )

            # -------------------------------
            # Response
            # -------------------------------

            return True, {

                "profile": {

                    "id": str(user.id),

                    "name": user.full_name,

                    "email": user.email

                },

                "accounts": [

                    {

                        "id": str(account.id),

                        "bank_name": account.bank_name,

                        "account_number":
                        account.account_number,

                        "balance":
                        float(account.current_balance)

                    }

                    for account in accounts

                ],

                "recent_transactions": [

                    {

                        "reference":
                        transaction.transaction_reference,

                        "receiver":
                        transaction.receiver_name,

                        "amount":
                        float(transaction.amount),

                        "status":
                        transaction.transaction_status.value

                    }

                    for transaction in transactions

                ],

                "recent_statements": [

                    {

                        "statement":
                        statement.statement_name,

                        "status":
                        statement.processing_status.value,

                        "transactions":
                        statement.total_transactions

                    }

                    for statement in statements

                ],

                "credit_score": credit,

                "loan_recommendation": loan,

                "financial_health": summary

            }

        except Exception as e:

            return False, str(e)

    # ==========================================
    # Bank Employee Dashboard
    # ==========================================

    @staticmethod
    def get_employee_dashboard():

        try:

            # Use the UserRole enum to filter, not a raw string
            total_customers = User.query.filter_by(
                role=UserRole.CUSTOMER
            ).count()

            total_accounts = BankAccount.query.count()

            total_transactions = Transaction.query.count()

            total_statements = UploadedStatement.query.count()

            flagged_transactions = (
                Transaction.query
                .filter(
                    Transaction.fraud_status.in_(
                        ["High Risk", "Blocked"]
                    )
                )
                .order_by(
                    Transaction.created_at.desc()
                )
                .limit(10)
                .all()
            )

            pending_statements = (
                UploadedStatement.query
                .filter_by(
                    processing_status=ProcessingStatus.PENDING
                )
                .order_by(
                    UploadedStatement.created_at.desc()
                )
                .limit(10)
                .all()
            )

            recent_customers = (
                User.query
                .filter_by(role=UserRole.CUSTOMER)
                .order_by(
                    User.created_at.desc()
                )
                .limit(10)
                .all()
            )

            return True, {

                "statistics": {

                    "total_customers": total_customers,

                    "total_accounts": total_accounts,

                    "total_transactions": total_transactions,

                    "total_statements": total_statements

                },

                "customer_management": [

                    {

                        "id": str(customer.id),

                        "name": customer.full_name,

                        "email": customer.email

                    }

                    for customer in recent_customers

                ],

                "transaction_monitoring": [

                    {

                        "reference":
                            transaction.transaction_reference,

                        "amount":
                            float(transaction.amount),

                        "risk_score":
                            transaction.risk_score,

                        "fraud_status":
                            transaction.fraud_status,

                        "status":
                            transaction.transaction_status.value

                    }

                    for transaction in flagged_transactions

                ],

                "statement_review": [

                    {

                        "id":
                            str(statement.id),

                        "statement":
                            statement.statement_name,

                        "status":
                            statement.processing_status.value,

                        "transactions":
                            statement.total_transactions

                    }

                    for statement in pending_statements

                ]

            }

        except Exception as e:

            return False, str(e)