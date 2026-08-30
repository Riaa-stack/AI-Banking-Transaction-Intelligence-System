from flask import request

from app.schemas.auth_schema import (
    CustomerSignupSchema,
    EmployeeSignupSchema,
    LoginSchema
)

from app.services.auth_service import AuthService
from app.utils.response import (
    success_response,
    error_response
)


customer_signup_schema = CustomerSignupSchema()
employee_signup_schema = EmployeeSignupSchema()
login_schema = LoginSchema()


class AuthController:

    # ==========================================
    # Customer Signup
    # ==========================================

    @staticmethod
    def customer_signup():

        try:

            json_data = request.get_json()

            if not json_data:
                return error_response(
                    "No input data provided.",
                    400
                )

            errors = customer_signup_schema.validate(
                json_data
            )

            if errors:
                return error_response(
                    errors,
                    400
                )

            loaded_data = customer_signup_schema.load(
                json_data
            )

            success, result = (
                AuthService.register_customer(
                    loaded_data
                )
            )

            if not success:
                return error_response(
                    result,
                    400
                )

            return success_response(

                "Customer registered successfully.",

                {
                    "id": str(result.id),
                    "full_name": result.full_name,
                    "email": result.email,
                    "role": result.role.value
                },

                201
            )

        except Exception as e:

            return error_response(
                str(e),
                500
            )

    # ==========================================
    # Employee Signup
    # ==========================================

    @staticmethod
    def employee_signup():

        try:

            json_data = request.get_json()

            if not json_data:
                return error_response(
                    "No input data provided.",
                    400
                )

            errors = employee_signup_schema.validate(
                json_data
            )

            if errors:
                return error_response(
                    errors,
                    400
                )

            loaded_data = employee_signup_schema.load(
                json_data
            )

            success, result = (
                AuthService.register_employee(
                    loaded_data
                )
            )

            if not success:
                return error_response(
                    result,
                    400
                )

            return success_response(

                "Employee registered successfully.",

                {
                    "id": str(result.id),
                    "full_name": result.full_name,
                    "email": result.email,
                    "role": result.role.value
                },

                201
            )

        except Exception as e:

            return error_response(
                str(e),
                500
            )

    # ==========================================
    # Login
    # ==========================================

    @staticmethod
    def login():

        try:

            json_data = request.get_json()

            if not json_data:
                return error_response(
                    "No input data provided.",
                    400
                )

            errors = login_schema.validate(
                json_data
            )

            if errors:
                return error_response(
                    errors,
                    400
                )

            success, result = AuthService.login(
                json_data
            )

            if not success:
                return error_response(
                    result,
                    401
                )

            return success_response(
                "Login successful.",
                result,
                200
            )

        except Exception as e:

            return error_response(
                str(e),
                500
            )