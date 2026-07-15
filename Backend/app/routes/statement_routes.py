from flask import Blueprint

from app.controllers.statement_controller import StatementController

statement_bp = Blueprint(
    "statements",
    __name__
)

# ==========================================
# Upload Bank Statement
# ==========================================
@statement_bp.route(
    "/upload",
    methods=["POST"]
)
def upload_statement():
    return StatementController.upload_statement()


# ==========================================
# Get Uploaded Statements
# ==========================================
@statement_bp.route(
    "/all",
    methods=["GET"]
)
def get_statements():
    return StatementController.get_statements()