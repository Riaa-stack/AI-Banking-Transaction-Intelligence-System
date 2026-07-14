from flask import Blueprint

from app.controllers.customer_controller import (
    CustomerController
)

customer_bp = Blueprint(
    "customer",
    __name__
)


# ==========================================
# Customer Dashboard
# ==========================================

@customer_bp.route(
    "/dashboard",
    methods=["GET"]
)
def get_dashboard():

    return CustomerController.get_dashboard()