from flask import Blueprint

from app.controllers.loan_controller import LoanController

loan_bp = Blueprint("loan", __name__)


# ==========================================
# Recommend Loans
# ==========================================

@loan_bp.route("/recommend", methods=["POST"])
def recommend():
    return LoanController.recommend()


# ==========================================
# Chat with Loan Assistant
# ==========================================

@loan_bp.route("/chat", methods=["POST"])
def chat():
    return LoanController.chat()
