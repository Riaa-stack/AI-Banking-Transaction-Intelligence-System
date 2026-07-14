from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from app.services.notification_service import NotificationService
from app.utils.response import (
    success_response,
    error_response
)


class NotificationController:

    # ==========================================
    # Get Notifications
    # ==========================================

    @staticmethod
    @jwt_required()
    def get_notifications():

        try:

            user_id = get_jwt_identity()

            success, result = (
                NotificationService.get_notifications(
                    user_id
                )
            )

            if not success:

                return error_response(
                    result,
                    400
                )

            return success_response(
                "Notifications fetched successfully.",
                result,
                200
            )

        except Exception as e:

            return error_response(
                str(e),
                500
            )

    # ==========================================
    # Mark Notification as Read
    # ==========================================

    @staticmethod
    @jwt_required()
    def mark_as_read(notification_id):

        try:

            user_id = get_jwt_identity()

            success, result = (
                NotificationService.mark_as_read(
                    user_id,
                    notification_id
                )
            )

            if not success:

                return error_response(
                    result,
                    404
                )

            return success_response(
                result,
                {},
                200
            )

        except Exception as e:

            return error_response(
                str(e),
                500
            )

    # ==========================================
    # Mark All Notifications as Read
    # ==========================================

    @staticmethod
    @jwt_required()
    def mark_all_as_read():

        try:

            user_id = get_jwt_identity()

            success, result = (
                NotificationService.mark_all_as_read(
                    user_id
                )
            )

            if not success:

                return error_response(
                    result,
                    400
                )

            return success_response(
                result,
                {},
                200
            )

        except Exception as e:

            return error_response(
                str(e),
                500
            )

    # ==========================================
    # Delete Notification
    # ==========================================

    @staticmethod
    @jwt_required()
    def delete_notification(notification_id):

        try:

            user_id = get_jwt_identity()

            success, result = (
                NotificationService.delete_notification(
                    user_id,
                    notification_id
                )
            )

            if not success:

                return error_response(
                    result,
                    404
                )

            return success_response(
                result,
                {},
                200
            )

        except Exception as e:

            return error_response(
                str(e),
                500
            )