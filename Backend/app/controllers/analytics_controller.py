from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from app.services.analytics_service import AnalyticsService
from app.utils.response import (
    success_response,
    error_response
)


class AnalyticsController:

    @staticmethod
    @jwt_required()
    def customer_analytics():

        success, result = (
            AnalyticsService.customer_analytics(
                get_jwt_identity()
            )
        )

        if not success:

            return error_response(result, 400)

        return success_response(
            "Customer analytics fetched successfully.",
            result
        )

    @staticmethod
    @jwt_required()
    def employee_analytics():

        success, result = (
            AnalyticsService.employee_analytics()
        )

        if not success:

            return error_response(result, 400)

        return success_response(
            "Employee analytics fetched successfully.",
            result
        )