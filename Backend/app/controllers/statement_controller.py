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


upload_statement_schema = UploadStatementSchema()


class StatementController:

    # ==========================================
    # Upload Statement
    # ==========================================

    @staticmethod
    @jwt_required()
    def upload_statement():

        try:

            if "statement" not in request.files:

                return error_response(
                    "Statement PDF is required.",
                    400
                )

            uploaded_file = request.files["statement"]

            data = upload_statement_schema.load(
                request.form.to_dict()
            )

            user_id = get_jwt_identity()

            success, result = (
                StatementService.upload_statement(
                    user_id,
                    data,
                    uploaded_file
                )
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

            return error_response(
                str(e),
                500
            )