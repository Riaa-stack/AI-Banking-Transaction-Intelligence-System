from flask import request
from marshmallow import ValidationError
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from app.schemas.transaction_schema import SendMoneySchema
from app.services.transaction_service import TransactionService
from app.utils.response import (
    success_response,
    error_response
)


send_money_schema = SendMoneySchema()


class TransactionController:

    # ==========================================
    # Send Money
    # ==========================================

    @staticmethod
    @jwt_required()
    def send_money():

        try:

            json_data = request.get_json()

            if not json_data:
                return error_response(
                    "Request body is required.",
                    400
                )

            data = send_money_schema.load(json_data)

            user_id = get_jwt_identity()

            success, result = TransactionService.send_money(
                user_id,
                data
            )

            if not success:
                if isinstance(result, str) and result.startswith("ACCOUNT_SECURITY_LOCKED"):
                    clean_msg = result.replace("ACCOUNT_SECURITY_LOCKED: ", "")
                    return error_response(
                        clean_msg,
                        403,
                        {"error_code": "ACCOUNT_SECURITY_LOCKED"}
                    )
                return error_response(
                    result,
                    400
                )

            return success_response(
                "Transaction completed successfully.",
                result,
                200
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

    # ==========================================
    # Transaction History
    # ==========================================

    @staticmethod
    @jwt_required()
    def get_transaction_history():

        try:

            user_id = get_jwt_identity()

            success, result = (
                TransactionService.get_transaction_history(
                    user_id
                )
            )

            if not success:
                return error_response(
                    result,
                    404
                )

            return success_response(
                "Transaction history fetched successfully.",
                result,
                200
            )

        except Exception as e:

            return error_response(
                str(e),
                500
            )

    # ==========================================
    # Transaction Details
    # ==========================================

    @staticmethod
    @jwt_required()
    def get_transaction(transaction_id):

        try:

            user_id = get_jwt_identity()

            success, result = (
                TransactionService.get_transaction(
                    user_id,
                    transaction_id
                )
            )

            if not success:
                return error_response(
                    result,
                    404
                )

            return success_response(
                "Transaction details fetched successfully.",
                result,
                200
            )

        except Exception as e:

            return error_response(
                str(e),
                500
            )