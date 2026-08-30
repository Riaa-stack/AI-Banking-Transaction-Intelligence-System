from flask import Blueprint

from app.controllers.credit_controller import CreditController


credit_bp = Blueprint(
    "credit",
    __name__
)


# ==========================================
# Predict Credit Score
# ==========================================

@credit_bp.route(
    "/predict",
    methods=["GET", "POST"]
)
def predict():

    return CreditController.predict()


# ==========================================
# Health Check
# ==========================================

@credit_bp.route(
    "/health",
    methods=["GET"]
)
def health():

    return CreditController.health()