from enum import Enum

from app.extensions import db
from app.models.base_model import BaseModel


# ==========================================================
# Credit Risk Category
# ==========================================================

class RiskCategory(Enum):
    POOR = "Poor"
    FAIR = "Fair"
    GOOD = "Good"
    VERY_GOOD = "Very Good"
    EXCELLENT = "Excellent"


# ==========================================================
# Credit Score Model
# ==========================================================

class CreditScore(BaseModel):

    __tablename__ = "credit_scores"

    # ======================================================
    # Customer
    # ======================================================

    customer_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # ======================================================
    # AI Prediction
    # ======================================================

    credit_score = db.Column(
        db.Integer,
        nullable=False
    )

    risk_category = db.Column(
        db.Enum(RiskCategory),
        nullable=False
    )

    confidence_score = db.Column(
        db.Float,
        default=0.0
    )

    financial_health = db.Column(
        db.String(50),
        default="Unknown"
    )

    # ======================================================
    # AI Insights
    # ======================================================

    ai_explanation = db.Column(
        db.Text,
        nullable=False
    )

    recommendations = db.Column(
        db.Text,
        nullable=False
    )

    # ======================================================
    # Prediction Information
    # ======================================================

    prediction_version = db.Column(
        db.String(20),
        default="v1.0"
    )

    is_latest = db.Column(
        db.Boolean,
        default=True
    )

    # ======================================================
    # Relationship
    # ======================================================

    customer = db.relationship(
        "User",
        backref=db.backref(
            "credit_scores",
            lazy=True,
            cascade="all, delete-orphan"
        )
    )

    # ======================================================
    # String Representation
    # ======================================================

    def __repr__(self):

        return (
            f"<CreditScore "
            f"{self.credit_score} "
            f"{self.risk_category.value}>"
        )