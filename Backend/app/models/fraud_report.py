from enum import Enum

from app.extensions import db
from app.models.base_model import BaseModel


class FraudStatus(Enum):
    GENUINE = "Genuine"
    SUSPICIOUS = "Suspicious"
    FRAUD = "Fraud"


class RiskLevel(Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class ReviewStatus(Enum):
    PENDING = "Pending"
    REVIEWED = "Reviewed"
    RESOLVED = "Resolved"


class FraudReport(BaseModel):

    __tablename__ = "fraud_reports"

    transaction_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("transactions.id"),
        nullable=False,
        unique=True
    )

    customer_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id"),
        nullable=False
    )

    fraud_probability = db.Column(
        db.Float,
        nullable=False
    )

    fraud_status = db.Column(
        db.Enum(FraudStatus),
        nullable=False
    )

    risk_level = db.Column(
        db.Enum(RiskLevel),
        nullable=False
    )

    ai_explanation = db.Column(
        db.Text,
        nullable=False
    )

    recommendation = db.Column(
        db.Text,
        nullable=False
    )

    review_status = db.Column(
        db.Enum(ReviewStatus),
        default=ReviewStatus.PENDING
    )

    reviewed_by = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id"),
        nullable=True
    )

    transaction = db.relationship(
        "Transaction",
        backref=db.backref(
            "fraud_report",
            uselist=False,
            lazy=True
        )
    )

    customer = db.relationship(
        "User",
        foreign_keys=[customer_id]
    )

    reviewer = db.relationship(
        "User",
        foreign_keys=[reviewed_by]
    )

    def __repr__(self):
        return f"<FraudReport {self.transaction_id}>"