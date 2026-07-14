from flask import Blueprint

from app.controllers.transaction_controller import (
    TransactionController
)

transaction_bp = Blueprint(
    "transactions",
    __name__,
    url_prefix="/transactions"
)

# ==================================================
# Send Money
# ==================================================

@transaction_bp.route(
    "/send-money",
    methods=["POST"]
)
def send_money():

    return TransactionController.send_money()


# ==================================================
# Transaction History
# ==================================================

@transaction_bp.route(
    "/history",
    methods=["GET"]
)
def get_transaction_history():

    return TransactionController.get_transaction_history()


# ==================================================
# Transaction Details
# ==================================================

@transaction_bp.route(
    "/<uuid:transaction_id>",
    methods=["GET"]
)
def get_transaction(transaction_id):

    return TransactionController.get_transaction(
        transaction_id
    )