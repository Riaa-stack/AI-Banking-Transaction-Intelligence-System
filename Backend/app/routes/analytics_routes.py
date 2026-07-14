from flask import Blueprint

from app.controllers.analytics_controller import (
    AnalyticsController
)

analytics_bp = Blueprint(
    "analytics",
    __name__,
    url_prefix="/analytics"
)


@analytics_bp.route(
    "/customer",
    methods=["GET"]
)
def customer_analytics():

    return AnalyticsController.customer_analytics()


@analytics_bp.route(
    "/employee",
    methods=["GET"]
)
def employee_analytics():

    return AnalyticsController.employee_analytics()