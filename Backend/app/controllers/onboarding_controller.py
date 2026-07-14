import json

from flask import request

from app.schemas.onboarding_schema import CustomerOnboardingSchema
from app.services.onboarding_service import OnboardingService
from app.utils.response import success_response, error_response


onboarding_schema = CustomerOnboardingSchema()


class OnboardingController:

    @staticmethod
    def onboard_customer():

        try:

            # -----------------------------
            # Customer Information
            # -----------------------------

            customer_data = {
                "full_name": request.form.get("full_name"),
                "email": request.form.get("email"),
                "mobile_number": request.form.get("mobile_number"),
                "government_id": request.form.get("government_id"),
                "date_of_birth": request.form.get("date_of_birth"),
                "address": request.form.get("address"),
                "password": request.form.get("password"),
                "confirm_password": request.form.get("confirm_password")
            }

            # -----------------------------
            # Validate Customer
            # -----------------------------

            errors = onboarding_schema.validate(customer_data)

            if errors:
                return error_response(errors)

            # -----------------------------
            # Accounts
            # -----------------------------

            accounts_json = request.form.get("accounts")

            if not accounts_json:
                return error_response("At least one bank account is required.")

            accounts = json.loads(accounts_json)

            # -----------------------------
            # Statement PDFs
            # -----------------------------

            statement_files = request.files.getlist("statements")

            if len(statement_files) != len(accounts):
                return error_response(
                    "Each account must have one statement PDF."
                )

            # -----------------------------
            # Service
            # -----------------------------

            success, result = OnboardingService.onboard_customer(
                customer_data,
                accounts,
                statement_files
            )

            if not success:
                return error_response(result)

            return success_response(
                "Customer onboarding completed successfully.",
                result,
                201
            )

        except Exception as e:

            return error_response(str(e), 500)