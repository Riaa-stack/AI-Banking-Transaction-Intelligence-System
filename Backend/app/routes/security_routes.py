from flask import Blueprint
from app.controllers.security_controller import SecurityController

security_bp = Blueprint("security", __name__)

@security_bp.route("/simulate-breach", methods=["POST"])
def simulate_breach():
    return SecurityController.simulate_breach()

@security_bp.route("/incidents", methods=["GET"])
def get_incidents():
    return SecurityController.get_incidents()

@security_bp.route("/recover-account", methods=["POST"])
def recover_account():
    return SecurityController.recover_account()

@security_bp.route("/reset-simulation", methods=["POST"])
def reset_simulation():
    return SecurityController.reset_simulation()

@security_bp.route("/test-email", methods=["POST", "GET"])
def test_email():
    return SecurityController.test_email()

