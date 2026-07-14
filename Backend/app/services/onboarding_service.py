
import os

from flask import current_app
from flask_jwt_extended import create_access_token

from app.extensions import db, bcrypt
from app.models.user import User, UserRole
from app.models.bank_account import (
    BankAccount,
    AccountType,
    AccountStatus
)
from app.models.uploaded_statement import (
    UploadedStatement,
    ProcessingStatus
)
from app.utils.file_upload import save_statement


class OnboardingService:

    @staticmethod
    def onboard_customer(customer_data, accounts, statement_files):

        try:

            # ---------------------------------
            # Check Existing User
            # ---------------------------------

            if User.query.filter_by(
                email=customer_data["email"]
            ).first():
                return False, "Email already registered."

            if User.query.filter_by(
                mobile_number=customer_data["mobile_number"]
            ).first():
                return False, "Mobile number already registered."

            if User.query.filter_by(
                government_id=customer_data["government_id"]
            ).first():
                return False, "Government ID already registered."

            # ---------------------------------
            # Hash Password
            # ---------------------------------

            hashed_password = bcrypt.generate_password_hash(
                customer_data["password"]
            ).decode("utf-8")

            # ---------------------------------
            # Create Customer
            # ---------------------------------

            customer = User(
                full_name=customer_data["full_name"],
                email=customer_data["email"],
                mobile_number=customer_data["mobile_number"],
                government_id=customer_data["government_id"],
                date_of_birth=customer_data["date_of_birth"],
                address=customer_data["address"],
                password=hashed_password,
                role=UserRole.CUSTOMER,
                is_active=True
            )

            db.session.add(customer)
            db.session.flush()

            # ---------------------------------
            # Upload Folder
            # ---------------------------------

            upload_folder = os.path.join(
                current_app.root_path,
                "..",
                "uploads",
                "statements"
            )

            # ---------------------------------
            # Loop Through Accounts
            # ---------------------------------

            for index, account_data in enumerate(accounts):

                account = BankAccount(

                    user_id=customer.id,

                    bank_name=account_data["bank_name"],

                    account_holder_name=account_data[
                        "account_holder_name"
                    ],

                    account_number=account_data[
                        "account_number"
                    ],

                    ifsc_code=account_data[
                        "ifsc_code"
                    ],

                    branch_name=account_data[
                        "branch_name"
                    ],

                    account_type=AccountType(
                        account_data["account_type"]
                    ),

                    current_balance=account_data[
                        "current_balance"
                    ],

                    is_primary=account_data.get(
                        "is_primary",
                        False
                    ),

                    account_status=AccountStatus.ACTIVE
                )

                db.session.add(account)
                db.session.flush()

                # -----------------------------
                # Upload Statement
                # -----------------------------

                uploaded = save_statement(
                    statement_files[index],
                    upload_folder
                )

                statement = UploadedStatement(

                    account_id=account.id,

                    statement_name=uploaded["filename"],

                    original_file_name=uploaded[
                        "original_filename"
                    ],

                    file_path=uploaded[
                        "file_path"
                    ],

                    file_size=uploaded[
                        "file_size"
                    ],

                    statement_month=account_data[
                        "statement_month"
                    ],

                    statement_year=account_data[
                        "statement_year"
                    ],

                    processing_status=ProcessingStatus.PENDING
                )

                db.session.add(statement)

            # ---------------------------------
            # Commit
            # ---------------------------------

            db.session.commit()

            access_token = create_access_token(
                identity=str(customer.id),
                additional_claims={
                    "email": customer.email,
                    "role": customer.role.value
                }
            )

            return True, {
                "access_token": access_token,
                "customer": {
                    "id": str(customer.id),
                    "name": customer.full_name,
                    "email": customer.email
                }
            }

        except Exception as e:

            db.session.rollback()

            return False, str(e)