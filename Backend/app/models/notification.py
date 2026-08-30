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



class Notification(BaseModel):

    __tablename__ = "notifications"

    # ==========================================
    # User
    # ==========================================

    customer_id = db.Column(
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


    # ==========================================
    # Status
    # ==========================================

    is_read = db.Column(
        db.Boolean,
        default=False
    )


    # ==========================================
    # Relationship
    # ==========================================

    customer = db.relationship(
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