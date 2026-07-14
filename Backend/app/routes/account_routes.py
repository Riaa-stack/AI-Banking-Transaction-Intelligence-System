from flask import Blueprint

from app.controllers.account_controller import AccountController


account_bp = Blueprint(
    "accounts",
    __name__
)


# =====================================
# Add New Bank Account
# =====================================
@account_bp.route(
    "/add",
    methods=["POST"]
)
def add_account():
    return AccountController.add_account()


# =====================================
# Get All Bank Accounts
# =====================================
@account_bp.route(
    "/all",
    methods=["GET"]
)
def get_all_accounts():
    return AccountController.get_all_accounts()


# =====================================
# Get Bank Account By ID
# =====================================
@account_bp.route(
    "/<uuid:account_id>",
    methods=["GET"]
)
def get_account(account_id):
    return AccountController.get_account(account_id)


# =====================================
# Delete Bank Account
# =====================================
@account_bp.route(
    "/delete/<uuid:account_id>",
    methods=["DELETE"]
)
def delete_account(account_id):
    return AccountController.delete_account(account_id)