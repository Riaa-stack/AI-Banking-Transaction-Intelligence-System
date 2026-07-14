from flask import Flask

from app.config.config import Config
from app.extensions import (
    db,
    migrate,
    jwt,
    bcrypt,
    cors
)

# Import all models
from app import models

# Import Blueprints
from app.routes.auth_routes import auth_bp
from app.routes.account_routes import account_bp
from app.routes.onboarding_routes import onboarding_bp
from app.routes.customer_routes import customer_bp
from app.routes.transaction_routes import transaction_bp
from app.routes.statement_routes import statement_bp


def create_app():
    app = Flask(__name__)

    # ============================
    # DEBUG SETTINGS
    # ============================
    app.config["PROPAGATE_EXCEPTIONS"] = True
    app.config["TRAP_HTTP_EXCEPTIONS"] = True

    # Load Configuration
    app.config.from_object(Config)

    # Initialize Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app)

    # ============================
    # JWT Error Handlers
    # ============================

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        print("====================================")
        print("INVALID TOKEN")
        print(reason)
        print("====================================")
        return {
            "success": False,
            "message": reason
        }, 401

    @jwt.unauthorized_loader
    def unauthorized_callback(reason):
        print("====================================")
        print("UNAUTHORIZED")
        print(reason)
        print("====================================")
        return {
            "success": False,
            "message": reason
        }, 401

    @jwt.expired_token_loader
    def expired_callback(jwt_header, jwt_payload):
        print("====================================")
        print("TOKEN EXPIRED")
        print("====================================")
        return {
            "success": False,
            "message": "Token expired"
        }, 401

    # ============================
    # GLOBAL ERROR LOGGER
    # ============================

    @app.errorhandler(Exception)
    def handle_exception(e):
        import traceback

        print("\n")
        print("=" * 80)
        print("FULL PYTHON TRACEBACK")
        print("=" * 80)

        traceback.print_exc()

        print("=" * 80)
        print("\n")

        raise e

    # ============================
    # Register Blueprints
    # ============================

    app.register_blueprint(
        auth_bp,
        url_prefix="/api/v1/auth"
    )

    app.register_blueprint(
        account_bp,
        url_prefix="/api/v1/accounts"
    )

    app.register_blueprint(
        onboarding_bp,
        url_prefix="/api/v1/onboarding"
    )

    app.register_blueprint(
        customer_bp,
        url_prefix="/api/v1/customers"
    )

    app.register_blueprint(
        transaction_bp,
        url_prefix="/api/v1/transactions"
    )

    app.register_blueprint(
        statement_bp,
        url_prefix="/api/v1/statements"
    )

    # ============================
    # Home Route
    # ============================

    @app.route("/")
    def home():
        return {
            "success": True,
            "message": "🚀 AI Banking & Transaction Intelligence System Backend Running Successfully",
            "version": "1.0.0"
        }, 200

    return app