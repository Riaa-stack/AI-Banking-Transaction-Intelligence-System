from enum import Enum

from app.extensions import db
from app.models.base_model import BaseModel


# =====================================
# Transaction Status
# =====================================

class TransactionStatus(Enum):
    PENDING = "Pending"
    SUCCESS = "Success"
    FAILED = "Failed"
    BLOCKED = "Blocked"


# =====================================
# Transaction Source
# =====================================

class TransactionSource(Enum):
    UPI = "UPI"
    IMPS = "IMPS"
    NEFT = "NEFT"
    RTGS = "RTGS"


# =====================================
# Transaction Type
# =====================================

class TransactionType(Enum):
    DEBIT = "Debit"
    CREDIT = "Credit"


class Transaction(BaseModel):

    __tablename__ = "transactions"

    # =====================================
    # Transaction Information
    # =====================================

    transaction_reference = db.Column(
        db.String(50),
        unique=True,
        nullable=False,
        index=True
    )

    transaction_type = db.Column(
        db.Enum(TransactionType),
        nullable=False,
        default=TransactionType.DEBIT
    )

    # =====================================
    # Sender Information
    # =====================================

    sender_account_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("bank_accounts.id"),
        nullable=False,
        index=True
    )

    # =====================================
    # Receiver Information
    # =====================================

    receiver_name = db.Column(
        db.String(150),
        nullable=False
    )

    receiver_account_number = db.Column(
        db.String(30),
        nullable=False,
        index=True
    )

    receiver_bank = db.Column(
        db.String(100),
        nullable=False
    )

    receiver_ifsc = db.Column(
        db.String(20),
        nullable=False
    )

    # =====================================
    # Transaction Details
    # =====================================

    amount = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    remarks = db.Column(
        db.Text
    )

    transaction_source = db.Column(
        db.Enum(TransactionSource),
        nullable=False
    )

    transaction_status = db.Column(
        db.Enum(TransactionStatus),
        nullable=False,
        default=TransactionStatus.PENDING,
        index=True
    )

    failure_reason = db.Column(
        db.String(255)
    )

    # =====================================
    # Balance Information
    # =====================================

    available_balance_before = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    available_balance_after = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    # =====================================
    # AI Transaction Monitoring
    # =====================================

    ai_reviewed = db.Column(
        db.Boolean,
        default=False
    )

    is_flagged = db.Column(
        db.Boolean,
        default=False
    )

    risk_score = db.Column(
        db.Float,
        default=0.0
    )

    fraud_probability = db.Column(
        db.Float,
        default=0.0
    )

    fraud_status = db.Column(
        db.String(30),
        default="Pending"
    )

    ai_explanation = db.Column(
        db.Text
    )

    # =====================================
    # Relationship
    # =====================================

    sender_account = db.relationship(
        "BankAccount",
        backref=db.backref(
            "transactions",
            lazy=True,
            cascade="all, delete-orphan"
        )
    )

    def __repr__(self):
        return (
            f"<Transaction {self.transaction_reference}>"
        )