from enum import Enum

from app.extensions import db
from app.models.base_model import BaseModel


# ==========================================
# Notification Type
# ==========================================

class NotificationType(Enum):
    TRANSACTION = "Transaction"
    FRAUD = "Fraud"
    STATEMENT = "Statement"
    LOAN = "Loan"
    SYSTEM = "System"


# ==========================================
# Notification Priority
# ==========================================

class NotificationPriority(Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class Notification(BaseModel):

    __tablename__ = "notifications"

    # ==========================================
    # User
    # ==========================================

    user_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # ==========================================
    # Notification Details
    # ==========================================

    title = db.Column(
        db.String(150),
        nullable=False
    )

    message = db.Column(
        db.Text,
        nullable=False
    )

    notification_type = db.Column(
        db.Enum(NotificationType),
        nullable=False
    )

    priority = db.Column(
        db.Enum(NotificationPriority),
        nullable=False,
        default=NotificationPriority.LOW
    )

    # ==========================================
    # Status
    # ==========================================

    is_read = db.Column(
        db.Boolean,
        default=False
    )

    read_at = db.Column(
        db.DateTime
    )

    # ==========================================
    # Relationship
    # ==========================================

    user = db.relationship(
        "User",
        backref=db.backref(
            "notifications",
            lazy=True,
            cascade="all, delete-orphan"
        )
    )

    def __repr__(self):

        return (
            f"<Notification {self.title}>"
        )