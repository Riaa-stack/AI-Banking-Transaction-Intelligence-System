from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.security_service import SecurityService
from app.utils.response import success_response, error_response
from app.extensions import db


class SecurityController:

    @staticmethod
    @jwt_required()
    def simulate_breach():
        user_id = get_jwt_identity()
        success, result = SecurityService.simulate_breach(user_id)
        if not success:
            return error_response(result, 400)
        return success_response("Security incident breach simulation started.", result, 200)

    @staticmethod
    @jwt_required()
    def get_incidents():
        user_id = get_jwt_identity()
        success, result = SecurityService.get_incidents(user_id)
        if not success:
            return error_response(result, 400)
        return success_response("Incidents fetched successfully.", result, 200)

    @staticmethod
    @jwt_required()
    def recover_account():
        user_id = get_jwt_identity()
        payload = request.get_json(silent=True) or {}
        incident_id = payload.get("incident_id")
        if not incident_id:
            return error_response("incident_id is required.", 400)

        success, result = SecurityService.recover_account(user_id, incident_id)
        if not success:
            return error_response(result, 400)
        return success_response(result, {}, 200)

    @staticmethod
    @jwt_required()
    def reset_simulation():
        user_id = get_jwt_identity()
        success, result = SecurityService.reset_simulation(user_id)
        if not success:
            return error_response(result, 400)
        return success_response(result, {}, 200)

    @staticmethod
    @jwt_required()
    def test_email():
        user_id = get_jwt_identity()
        payload = request.get_json(silent=True) or {}
        recipient = payload.get("recipient")
        result = SecurityService.test_incident_email(user_id=user_id, recipient=recipient)
        status_code = 200 if result.get("success") else 400
        if result.get("simulated"):
            status_code = 200
        return success_response(result.get("message"), result, status_code)

