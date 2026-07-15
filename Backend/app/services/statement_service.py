import os
import uuid

from werkzeug.utils import secure_filename

from app.extensions import db
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

            "." in filename

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

            if uploaded_file is None:

                return False, "Statement file is required."

            if uploaded_file.filename == "":

                return False, "Please select a PDF."

            if not StatementService.allowed_file(

                uploaded_file.filename

            ):

                return False, "Only PDF statements are allowed."

            account = (

                BankAccount.query.filter_by(

                    id=data["account_id"],

                    user_id=user_id

                ).first()

            )

            if not account:

                return False, "Bank account not found."

            os.makedirs(

                StatementService.UPLOAD_FOLDER,

                exist_ok=True

            )

            filename = (

                f"{uuid.uuid4()}_"

                f"{secure_filename(uploaded_file.filename)}"

            )

            filepath = os.path.join(

                StatementService.UPLOAD_FOLDER,

                filename

            )

            uploaded_file.save(filepath)

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

            # OCR

            ocr_result = OCRProcessor.process(

                statement

            )

            statement.processing_status = (

                ProcessingStatus.COMPLETED

            )

            statement.ocr_status = "Completed"

            statement.ocr_confidence = (

                ocr_result["confidence"]

            )

            statement.extracted_text = (

                ocr_result["text"]

            )

            statement.total_transactions = (

                ocr_result["transaction_count"]

            )

            statement.ai_summary = (

                ocr_result["summary"]

            )

            statement.is_ai_processed = True

            db.session.commit()

            return True, {

                "statement_id": str(statement.id),

                "statement_name": statement.statement_name,

                "processing_status": statement.processing_status.value,

                "ocr_status": statement.ocr_status,

                "total_transactions": statement.total_transactions

            }

        except Exception as e:

            db.session.rollback()

            return False, str(e)
            # ==========================================
    # Get Customer Statements
    # ==========================================

    @staticmethod
    def get_statements(user_id):

        try:

            statements = (
                UploadedStatement.query
                .join(BankAccount)
                .filter(BankAccount.user_id == user_id)
                .order_by(UploadedStatement.created_at.desc())
                .all()
            )

            return True, statements

        except Exception as e:

            return False, str(e)