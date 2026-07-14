from enum import Enum

from app.extensions import db
from app.models.base_model import BaseModel


class RiskCategory(Enum):
    POOR = "Poor"
    FAIR = "Fair"
    GOOD = "Good"
    VERY_GOOD = "Very Good"
    EXCELLENT = "Excellent"


class CreditScore(BaseModel):

    __tablename__ = "credit_scores"

    customer_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id"),
        nullable=False
    )

    credit_score = db.Column(
        db.Integer,
        nullable=False
    )

    risk_category = db.Column(
        db.Enum(RiskCategory),
        nullable=False
    )

    ai_explanation = db.Column(
        db.Text,
        nullable=False
    )

    recommendations = db.Column(
        db.Text,
        nullable=False
    )

    prediction_version = db.Column(
        db.String(20),
        default="v1.0"
    )

    customer = db.relationship(
        "User",
        backref=db.backref(
            "credit_scores",
            lazy=True,
            cascade="all, delete-orphan"
        )
    )

    def __repr__(self):
        return f"<CreditScore {self.credit_score}>"