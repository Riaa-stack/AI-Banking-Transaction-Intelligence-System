from flask import Blueprint

from app.controllers.notification_controller import (
    NotificationController
)

notification_bp = Blueprint(
    "notifications",
    __name__,
    url_prefix="/notifications"
)

# ==========================================
# Get Notifications
# ==========================================

@notification_bp.route(
    "",
    methods=["GET"]
)
def get_notifications():

    return NotificationController.get_notifications()


# ==========================================
# Mark Notification as Read
# ==========================================

@notification_bp.route(
    "/<uuid:notification_id>/read",
    methods=["PATCH"]
)
def mark_as_read(notification_id):

    return NotificationController.mark_as_read(
        notification_id
    )


# ==========================================
# Mark All Notifications as Read
# ==========================================

@notification_bp.route(
    "/read-all",
    methods=["PATCH"]
)
def mark_all_as_read():

    return NotificationController.mark_all_as_read()


# ==========================================
# Delete Notification
# ==========================================

@notification_bp.route(
    "/<uuid:notification_id>",
    methods=["DELETE"]
)
def delete_notification(notification_id):

    return NotificationController.delete_notification(
        notification_id
    )