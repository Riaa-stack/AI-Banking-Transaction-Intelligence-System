from enum import Enum

from app.extensions import db
from app.models.base_model import BaseModel


# ==========================================
# Processing Status
# ==========================================

class ProcessingStatus(Enum):
    PENDING = "Pending"
    PROCESSING = "Processing"
    COMPLETED = "Completed"
    FAILED = "Failed"


class UploadedStatement(BaseModel):

    __tablename__ = "uploaded_statements"

    # ==========================================
    # Bank Account
    # ==========================================

    account_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("bank_accounts.id"),
        nullable=False,
        index=True
    )

    # ==========================================
    # File Information
    # ==========================================

    statement_name = db.Column(
        db.String(255),
        nullable=False
    )

    original_file_name = db.Column(
        db.String(255),
        nullable=False
    )

    file_path = db.Column(
        db.String(500),
        nullable=False
    )



    file_size = db.Column(
        db.BigInteger
    )

    # ==========================================
    # Statement Details
    # ==========================================

    statement_month = db.Column(
        db.String(20),
        nullable=False
    )

    statement_year = db.Column(
        db.Integer,
        nullable=False,
        index=True
    )

    statement_start_date = db.Column(
        db.Date
    )

    statement_end_date = db.Column(
        db.Date
    )

    # ==========================================
    # Upload Information
    # ==========================================

    uploaded_date = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

    # ==========================================
    # OCR & AI Processing
    # ==========================================

    processing_status = db.Column(
        db.Enum(ProcessingStatus),
        nullable=False,
        default=ProcessingStatus.PENDING,
        index=True
    )

    ocr_status = db.Column(
        db.String(50),
        default="Pending"
    )



    is_ai_processed = db.Column(
        db.Boolean,
        default=False
    )



    # ==========================================
    # Extracted Information
    # ==========================================

    total_transactions = db.Column(
        db.Integer,
        default=0
    )

    ai_summary = db.Column(
        db.Text
    )

    # ==========================================
    # Relationship
    # ==========================================

    account = db.relationship(
        "BankAccount",
        back_populates="statements"
    )

    def __repr__(self):
        return (
            f"<UploadedStatement {self.statement_name}>"
        )