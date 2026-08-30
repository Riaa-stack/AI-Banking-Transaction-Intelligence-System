from flask import request
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from app.services.credit_service import CreditService
from app.utils.response import (
    success_response,
    error_response
)


class CreditController:

    # ==========================================
    # Predict Credit Score
    # ==========================================

    @staticmethod
    @jwt_required()
    def predict():

        try:

            user_id = get_jwt_identity()
            json_payload = request.get_json(silent=True) or {}

            result = CreditService.predict_credit_score(
                user_id,
                payload=json_payload
            )

            return success_response(
                "Credit score predicted successfully.",
                result,
                200
            )

        except Exception as e:

            return error_response(
                str(e),
                500
            )

    # ==========================================
    # Health Check
    # ==========================================

    @staticmethod
    def health():

        return success_response(
            "Credit Score Service Running"
        )