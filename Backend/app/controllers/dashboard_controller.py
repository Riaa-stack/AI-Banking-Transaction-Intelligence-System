from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from app.services.dashboard_service import DashboardService
from app.utils.response import (
    success_response,
    error_response
)


class DashboardController:

    # ==========================================
    # Customer Dashboard
    # ==========================================

    @staticmethod
    @jwt_required()
    def customer_dashboard():

        try:

            user_id = get_jwt_identity()

            success, result = (
                DashboardService.get_customer_dashboard(
                    user_id
                )
            )

            if not success:

                return error_response(
                    result,
                    404
                )

            return success_response(
                "Customer dashboard fetched successfully.",
                result,
                200
            )

        except Exception as e:

            return error_response(
                str(e),
                500
            )
        # ==========================================
# Employee Dashboard
# ==========================================

@staticmethod
@jwt_required()
def employee_dashboard():

    try:

        success, result = (
            DashboardService.get_employee_dashboard()
        )

        if not success:

            return error_response(
                result,
                404
            )

        return success_response(
            "Employee dashboard fetched successfully.",
            result,
            200
        )

    except Exception as e:

        return error_response(
            str(e),
            500
        )