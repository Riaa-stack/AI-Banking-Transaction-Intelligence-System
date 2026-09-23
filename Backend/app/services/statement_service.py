import os
import uuid

from werkzeug.utils import secure_filename

from app.extensions import db

from app.models.user import User

from app.models.bank_account import BankAccount

from app.models.uploaded_statement import (
    UploadedStatement,
    ProcessingStatus
)

from app.ai.ocr_processor import OCRProcessor


class StatementService:

    ALLOWED_EXTENSIONS = {"pdf"}

    UPLOAD_FOLDER = "uploads/statements"

    MAX_FILE_SIZE = 10 * 1024 * 1024

    # ==========================================
    # Check Extension
    # ==========================================

    @staticmethod
    def allowed_file(filename):

        return (
            "."
            in filename

            and

            filename.rsplit(".", 1)[1].lower()
            in
            StatementService.ALLOWED_EXTENSIONS
        )

    # ==========================================
    # Upload Statement
    # ==========================================

    @staticmethod
    def upload_statement(
        user_id,
        data,
        uploaded_file
    ):

        try:

            # ==========================================
            # Check File
            # ==========================================

            if uploaded_file is None:

                return False, "Statement file is required."

            if uploaded_file.filename == "":

                return False, "Please select a PDF."

            if not StatementService.allowed_file(
                uploaded_file.filename
            ):

                return False, "Only PDF statements are allowed."

            # ==========================================
            # Verify Bank Account
            # ==========================================

            account = (
                BankAccount.query.filter_by(
                    id=data["account_id"],
                    user_id=user_id
                ).first()
            )

            if not account:

                return False, "Bank account not found."

            # ==========================================
            # Create Upload Folder
            # ==========================================

            os.makedirs(
                StatementService.UPLOAD_FOLDER,
                exist_ok=True
            )

            # ==========================================
            # Generate Filename
            # ==========================================

            filename = (
                f"{uuid.uuid4()}_"
                f"{secure_filename(uploaded_file.filename)}"
            )

            filepath = os.path.join(
                StatementService.UPLOAD_FOLDER,
                filename
            )

            # ==========================================
            # Save File
            # ==========================================

            uploaded_file.save(filepath)

            # ==========================================
            # Create Uploaded Statement
            # ==========================================

            statement = UploadedStatement(

                account_id=account.id,

                statement_name=filename,

                original_file_name=uploaded_file.filename,

                file_path=filepath,

                file_size=os.path.getsize(filepath),

                statement_month=data["statement_month"],

                statement_year=data["statement_year"],

                statement_start_date=data["statement_start_date"],

                statement_end_date=data["statement_end_date"],

                processing_status=ProcessingStatus.PROCESSING

            )

            db.session.add(statement)

            db.session.commit()

            # ==========================================
            # OCR
            # ==========================================

            ocr_result = OCRProcessor.process(
                statement
            )

            # ==========================================
            # Update OCR Results
            # ==========================================

            statement.processing_status = (
                ProcessingStatus.COMPLETED
            )

            statement.ocr_status = "Completed"

            statement.total_transactions = (
                ocr_result["transaction_count"]
            )

            statement.ai_summary = (
                ocr_result["summary"]
            )

            statement.is_ai_processed = True

            db.session.commit()

            # ==========================================
            # Success Response
            # ==========================================

            return True, {

                "statement_id":
                    str(statement.id),

                "statement_name":
                    statement.statement_name,

                "processing_status":
                    statement.processing_status.value,

                "ocr_status":
                    statement.ocr_status,

                "total_transactions":
                    statement.total_transactions
            }

        except Exception as e:

            db.session.rollback()

            return False, str(e)

    # ==========================================
    # Get Statements
    # ==========================================

    @staticmethod
    def get_statements(user_id):

        try:

            # ==========================================
            # Get Logged-In User
            # ==========================================

            user = User.query.filter_by(
                id=user_id
            ).first()

            if not user:

                return False, "User not found."

            # ==========================================
            # Normalize Role
            # ==========================================

            role = user.role

            # SQLAlchemy Enum
            if hasattr(role, "value"):

                role_value = role.value

            # Normal string
            else:

                role_value = str(role)

            role_value = (
                role_value
                .strip()
                .upper()
            )

            # ==========================================
            # DEBUG INFORMATION
            # ==========================================

            print(
                "=========================================="
            )

            print(
                "STATEMENT ACCESS DEBUG"
            )

            print(
                "User ID:",
                user_id
            )

            print(
                "User Email:",
                getattr(user, "email", None)
            )

            print(
                "User Role:",
                role
            )

            print(
                "Normalized Role:",
                role_value
            )

            print(
                "=========================================="
            )

            # ==========================================
            # EMPLOYEE
            # ==========================================
            #
            # Employees can review statements uploaded
            # by ALL customers.
            # ==========================================

            if role_value == "EMPLOYEE":

                statements = (
                    UploadedStatement.query
                    .join(
                        BankAccount,
                        UploadedStatement.account_id
                        == BankAccount.id
                    )
                    .order_by(
                        UploadedStatement.created_at.desc()
                    )
                    .all()
                )

            # ==========================================
            # CUSTOMER
            # ==========================================
            #
            # Customers can only see statements belonging
            # to their own bank accounts.
            # ==========================================

            else:

                statements = (
                    UploadedStatement.query
                    .join(
                        BankAccount,
                        UploadedStatement.account_id
                        == BankAccount.id
                    )
                    .filter(
                        BankAccount.user_id == user_id
                    )
                    .order_by(
                        UploadedStatement.created_at.desc()
                    )
                    .all()
                )

            # ==========================================
            # DEBUG COUNT
            # ==========================================

            print(
                "Statements Found:",
                len(statements)
            )

            print(
                "=========================================="
            )

            return True, statements

        except Exception as e:

            print(
                "STATEMENT RETRIEVAL ERROR:",
                str(e)
            )

            return False, str(e)