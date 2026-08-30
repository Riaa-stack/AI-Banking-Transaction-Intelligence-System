from app.extensions import db
from app.models.bank_account import (
    BankAccount,
    AccountType,
    AccountStatus
)


class AccountService:

    @staticmethod
    def create_account(user, data):
        try:

            # Check if account number already exists
            existing_account = BankAccount.query.filter_by(
                account_number=data["account_number"]
            ).first()

            if existing_account:
                return False, "Account number already exists."

            # If this account is marked as primary,
            # remove primary flag from existing primary account
            if data.get("is_primary", False):

                primary_account = BankAccount.query.filter_by(
                    user_id=user.id,
                    is_primary=True
                ).first()

                if primary_account:
                    primary_account.is_primary = False

            # Create Bank Account
            account = BankAccount(
                user_id=user.id,
                bank_name=data["bank_name"],
                account_holder_name=data["account_holder_name"],
                account_number=data["account_number"],
                ifsc_code=data["ifsc_code"],
                branch_name=data["branch_name"],
                account_type=AccountType(data["account_type"]),
                current_balance=data["current_balance"],
                is_primary=data.get("is_primary", False),
                account_status=AccountStatus.ACTIVE
            )

            db.session.add(account)
            db.session.commit()

            return True, account

        except Exception as e:

            db.session.rollback()

            return False, str(e)

    @staticmethod
    def get_all_accounts(user_or_id):

        try:
            user_id = user_or_id.id if hasattr(user_or_id, 'id') else user_or_id

            accounts = BankAccount.query.filter_by(
                user_id=user_id
            ).all()

            return True, accounts

        except Exception as e:
            import traceback
            print("=== Error in AccountService.get_all_accounts ===")
            traceback.print_exc()
            return False, str(e)

    @staticmethod
    def get_account_by_id(account_id):

        try:

            account = BankAccount.query.filter_by(
                id=account_id
            ).first()

            if not account:
                return False, "Account not found."

            return True, account

        except Exception as e:

            return False, str(e)

    @staticmethod
    def delete_account(account):

        try:

            db.session.delete(account)
            db.session.commit()

            return True, "Account deleted successfully."

        except Exception as e:

            db.session.rollback()

            return False, str(e)