from enum import Enum

from app.extensions import db
from app.models.base_model import BaseModel


class AccountType(Enum):
    SAVINGS = "Savings"
    CURRENT = "Current"


class AccountStatus(Enum):
    ACTIVE = "Active"
    FROZEN = "Frozen"
    CLOSED = "Closed"


class BankAccount(BaseModel):

    __tablename__ = "bank_accounts"

    # Relationship with User
    user_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id"),
        nullable=False
    )

    # Bank Details
    bank_name = db.Column(
        db.String(100),
        nullable=False
    )

    account_holder_name = db.Column(
        db.String(150),
        nullable=False
    )

    account_number = db.Column(
        db.String(30),
        unique=True,
        nullable=False
    )

    ifsc_code = db.Column(
        db.String(20),
        nullable=False
    )

    branch_name = db.Column(
        db.String(150),
        nullable=False
    )

    account_type = db.Column(
        db.Enum(AccountType),
        nullable=False
    )

    # Balance
    current_balance = db.Column(
        db.Numeric(12, 2),
        nullable=False,
        default=0
    )

    # Primary Account
    is_primary = db.Column(
        db.Boolean,
        default=False
    )

    # Status
    account_status = db.Column(
        db.Enum(AccountStatus),
        nullable=False,
        default=AccountStatus.ACTIVE
    )

    # Optional Information
    account_opening_date = db.Column(
        db.Date
    )

    account_nickname = db.Column(
        db.String(100)
    )

    # Relationships
    user = db.relationship(
        "User",
        backref=db.backref(
            "bank_accounts",
            lazy=True,
            cascade="all, delete-orphan"
        )
    )

    statements = db.relationship(
        "UploadedStatement",
        back_populates="account",
        cascade="all, delete-orphan",
        lazy=True
    )

    def __repr__(self):
        return f"<BankAccount {self.account_number}>"