from sqlalchemy.orm import joinedload

from app.models.user import User
from app.models.notification import Notification
from app.models.uploaded_statement import UploadedStatement


class CustomerService:

    @staticmethod
    def get_dashboard(user_id):
        """
        Returns complete dashboard data for logged-in customer.
        """

        user = (
            User.query.options(
                joinedload(User.bank_accounts)
            )
            .filter_by(id=user_id)
            .first()
        )

        if not user:
            return False, "Customer not found."

        # -------------------------------
        # Accounts
        # -------------------------------

        accounts = []

        total_balance = 0

        for account in user.bank_accounts:

            balance = float(account.current_balance)

            total_balance += balance

            accounts.append({

                "id": str(account.id),

                "bank_name": account.bank_name,

                "account_holder_name": account.account_holder_name,

                "account_number": account.account_number,

                "ifsc_code": account.ifsc_code,

                "branch_name": account.branch_name,

                "account_type": account.account_type.value,

                "current_balance": balance,

                "is_primary": account.is_primary,

                "status": account.account_status.value

            })

        # -------------------------------
        # Notifications
        # -------------------------------

        notifications = Notification.query.filter_by(
            customer_id=user.id
        ).order_by(
            Notification.created_at.desc()
        ).limit(5).all()

        notification_list = []

        for notification in notifications:

            notification_list.append({

                "id": str(notification.id),

                "title": notification.title,

                "message": notification.message,

                "is_read": notification.is_read,

                "created_at": notification.created_at.isoformat()

            })

        # -------------------------------
        # Uploaded Statements
        # -------------------------------

        statements = (
            UploadedStatement.query
            .join(
                UploadedStatement.account
            )
            .filter_by(user_id=user.id)
            .order_by(
                UploadedStatement.created_at.desc()
            )
            .limit(5)
            .all()
        )

        statement_list = []

        for statement in statements:

            statement_list.append({

                "id": str(statement.id),

                "statement_name": statement.statement_name,

                "month": statement.statement_month,

                "year": statement.statement_year,

                "processing_status":
                    statement.processing_status.value,

                "ocr_status":
                    statement.ocr_status,

                "is_ai_processed":
                    statement.is_ai_processed

            })

        dashboard = {

            "customer": {

                "id": str(user.id),

                "full_name": user.full_name,

                "email": user.email,

                "mobile_number": user.mobile_number,

                "profile_image": user.profile_image

            },

            "accounts": accounts,

            "total_accounts": len(accounts),

            "total_balance": total_balance,

            "recent_statements": statement_list,

            "notifications": notification_list

        }

        return True, dashboard