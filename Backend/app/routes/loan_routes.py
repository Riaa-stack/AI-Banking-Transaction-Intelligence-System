from flask import Blueprint

from app.controllers.loan_controller import LoanController


# ============================================================
# LOAN BLUEPRINT
# ============================================================

loan_bp = Blueprint(
    "loan",
    __name__
)


# ============================================================
# GET LOANS
# ============================================================
#
# Frontend calls:
#
# GET /api/v1/loans
#
# The blueprint is registered in app/__init__.py as:
#
# /api/v1/loans
#
# Therefore this route becomes:
#
# /api/v1/loans
# ============================================================

@loan_bp.route(
    "",
    methods=["GET"]
)
def get_loans():

    return LoanController.recommend()


# ============================================================
# RECOMMEND LOANS
# ============================================================

@loan_bp.route(
    "/recommend",
    methods=["POST"]
)
def recommend():

    return LoanController.recommend()


# ============================================================
# LOAN CHAT
# ============================================================

@loan_bp.route(
    "/chat",
    methods=["POST"]
)
def chat():

    return LoanController.chat()