from flask import Blueprint

from app.controllers.onboarding_controller import OnboardingController


onboarding_bp = Blueprint(
    "onboarding",
    __name__
)


@onboarding_bp.route(
    "/customer",
    methods=["POST"]
)
def onboard_customer():

    return OnboardingController.onboard_customer()