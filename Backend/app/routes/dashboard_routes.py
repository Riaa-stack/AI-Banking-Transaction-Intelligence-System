from flask import Blueprint

from app.controllers.dashboard_controller import (
    DashboardController
)

dashboard_bp = Blueprint(
    "dashboard",
    __name__,
    url_prefix="/dashboard"
)

# ==========================================
# Customer Dashboard
# ==========================================

@dashboard_bp.route(
    "/customer",
    methods=["GET"]
)
def customer_dashboard():

    return DashboardController.customer_dashboard()

# ==========================================
# Employee Dashboard
# ==========================================

@dashboard_bp.route(
    "/employee",
    methods=["GET"]
)
def employee_dashboard():

    return DashboardController.employee_dashboard()