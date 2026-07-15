from flask import request
from marshmallow import ValidationError
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from app.schemas.statement_schema import UploadStatementSchema
from app.services.statement_service import StatementService
from app.utils.response import (
    success_response,
    error_response
)


class StatementController:

    @staticmethod
    @jwt_required()
    def upload_statement():

        try:

            # =====================================
            # Check File
            # =====================================

            if "statement" not in request.files:

                return error_response(
                    "Statement PDF is required.",
                    400
                )

            uploaded_file = request.files["statement"]

            # =====================================
            # Validate Form Data
            # =====================================

            schema = UploadStatementSchema()

            data = schema.load(
                request.form.to_dict()
            )

            # =====================================
            # Logged-in User
            # =====================================

            user_id = get_jwt_identity()

            # =====================================
            # Upload Statement
            # =====================================

            success, result = StatementService.upload_statement(
                user_id=user_id,
                data=data,
                uploaded_file=uploaded_file
            )

            if not success:

                return error_response(
                    result,
                    400
                )

            return success_response(
                "Statement uploaded successfully.",
                result,
                201
            )

        except ValidationError as err:

            return error_response(
                err.messages,
                400
            )

        except Exception as e:

            print("UPLOAD ERROR :", e)

            return error_response(
                str(e),
                500
            )
            # ==========================================
    # Get Customer Statements
    # ==========================================

    @staticmethod
    @jwt_required()
    def get_statements():

        try:

            user_id = get_jwt_identity()

            success, result = StatementService.get_statements(
                user_id
            )

            if not success:

                return error_response(
                    result,
                    400
                )

            statements = []

            for statement in result:

                statements.append({

                    "id": str(statement.id),

                    "account_id": str(statement.account_id),

                    "statement_name": statement.statement_name,

                    "original_file_name": statement.original_file_name,

                    "statement_month": statement.statement_month,

                    "statement_year": statement.statement_year,

                    "processing_status": statement.processing_status.value,

                    "ocr_status": statement.ocr_status,

                    "ocr_confidence": statement.ocr_confidence,

                    "total_transactions": statement.total_transactions,

                    "ai_summary": statement.ai_summary,

                    "is_ai_processed": statement.is_ai_processed,

                    "created_at": str(statement.created_at)

                })

            return success_response(

                "Statements fetched successfully.",

                statements

            )

        except Exception as e:

            return error_response(

                str(e),

                500

            )