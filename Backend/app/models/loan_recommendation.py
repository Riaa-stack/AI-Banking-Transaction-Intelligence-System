from enum import Enum

from app.extensions import db
from app.models.base_model import BaseModel


class LoanType(Enum):
    PERSONAL = "Personal Loan"
    HOME = "Home Loan"
    EDUCATION = "Education Loan"
    VEHICLE = "Vehicle Loan"
    BUSINESS = "Business Loan"


class EligibilityStatus(Enum):
    ELIGIBLE = "Eligible"
    PARTIALLY_ELIGIBLE = "Partially Eligible"
    NOT_ELIGIBLE = "Not Eligible"


class LoanRecommendation(BaseModel):

    __tablename__ = "loan_recommendations"

    customer_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id"),
        nullable=False
    )

    loan_type = db.Column(
        db.Enum(LoanType),
        nullable=False
    )

    recommended_amount = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    interest_rate = db.Column(
        db.Float,
        nullable=False
    )

    emi = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    tenure_months = db.Column(
        db.Integer,
        nullable=False
    )

    eligibility_status = db.Column(
        db.Enum(EligibilityStatus),
        nullable=False
    )

    ai_explanation = db.Column(
        db.Text,
        nullable=False
    )

    financial_recommendations = db.Column(
        db.Text,
        nullable=False
    )

    customer = db.relationship(
        "User",
        backref=db.backref(
            "loan_recommendations",
            lazy=True,
            cascade="all, delete-orphan"
        )
    )

    def __repr__(self):
        return f"<LoanRecommendation {self.loan_type.value}>"