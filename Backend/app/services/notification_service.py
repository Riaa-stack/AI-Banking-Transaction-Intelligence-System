from datetime import datetime

from app.extensions import db
from app.models.notification import (
    Notification,
    NotificationType,
    NotificationPriority
)


class NotificationService:

    # ==========================================
    # Create Notification
    # ==========================================

    @staticmethod
    def create_notification(

        user_id,

        title,

        message,

        notification_type,

        priority=NotificationPriority.LOW

    ):

        try:

            notification = Notification(

                user_id=user_id,

                title=title,

                message=message,

                notification_type=notification_type,

                priority=priority

            )

            db.session.add(notification)
            db.session.commit()

            return True, notification

        except Exception as e:

            db.session.rollback()

            return False, str(e)

    # ==========================================
    # Get Notifications
    # ==========================================

    @staticmethod
    def get_notifications(user_id):

        try:

            notifications = (

                Notification.query

                .filter_by(user_id=user_id)

                .order_by(

                    Notification.created_at.desc()

                )

                .all()

            )

            data = []

            for notification in notifications:

                data.append({

                    "id":
                        str(notification.id),

                    "title":
                        notification.title,

                    "message":
                        notification.message,

                    "notification_type":
                        notification.notification_type.value,

                    "priority":
                        notification.priority.value,

                    "is_read":
                        notification.is_read,

                    "created_at":
                        notification.created_at.isoformat()

                })

            return True, data

        except Exception as e:

            return False, str(e)

    # ==========================================
    # Mark Notification as Read
    # ==========================================

    @staticmethod
    def mark_as_read(

        user_id,

        notification_id

    ):

        try:

            notification = (

                Notification.query

                .filter_by(

                    id=notification_id,

                    user_id=user_id

                )

                .first()

            )

            if not notification:

                return False, "Notification not found."

            notification.is_read = True

            notification.read_at = datetime.utcnow()

            db.session.commit()

            return True, "Notification marked as read."

        except Exception as e:

            db.session.rollback()

            return False, str(e)

    # ==========================================
    # Mark All Notifications as Read
    # ==========================================

    @staticmethod
    def mark_all_as_read(user_id):

        try:

            notifications = (

                Notification.query

                .filter_by(

                    user_id=user_id,

                    is_read=False

                )

                .all()

            )

            for notification in notifications:

                notification.is_read = True

                notification.read_at = datetime.utcnow()

            db.session.commit()

            return True, "All notifications marked as read."

        except Exception as e:

            db.session.rollback()

            return False, str(e)

    # ==========================================
    # Delete Notification
    # ==========================================

    @staticmethod
    def delete_notification(

        user_id,

        notification_id

    ):

        try:

            notification = (

                Notification.query

                .filter_by(

                    id=notification_id,

                    user_id=user_id

                )

                .first()

            )

            if not notification:

                return False, "Notification not found."

            db.session.delete(notification)

            db.session.commit()

            return True, "Notification deleted successfully."

        except Exception as e:

            db.session.rollback()

            return False, str(e)