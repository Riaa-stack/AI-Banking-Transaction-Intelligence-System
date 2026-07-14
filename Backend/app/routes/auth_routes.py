from flask import Blueprint

from app.controllers.auth_controller import AuthController

auth_bp = Blueprint(
    "auth",
    __name__
)

# ==========================
# Customer Authentication
# ==========================

# Customer Signup
@auth_bp.route(
    "/customer/signup",
    methods=["POST"]
)
def customer_signup():
    return AuthController.customer_signup()


# Customer Login
@auth_bp.route(
    "/login",
    methods=["POST"]
)
def login():
    return AuthController.login()

# Employee Signup
@auth_bp.route(
    "/employee/signup",
    methods=["POST"]
)
def employee_signup():
    return AuthController.employee_signup()