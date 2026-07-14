from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from app.services.customer_service import CustomerService
from app.utils.response import (
    success_response,
    error_response
)


class CustomerController:

    @staticmethod
    @jwt_required()
    def get_dashboard():
        """
        Returns dashboard information
        for the logged-in customer.
        """

        try:

            user_id = get_jwt_identity()

            success, result = CustomerService.get_dashboard(
                user_id
            )

            if not success:
                return error_response(
                    result,
                    404
                )

            return success_response(
                "Dashboard fetched successfully.",
                result,
                200
            )

        except Exception as e:
            import traceback

            print("=" * 80)
            traceback.print_exc()
            print("=" * 80)

            return error_response(
                str(e),
                500
            )