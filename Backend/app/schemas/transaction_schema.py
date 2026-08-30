import re

from marshmallow import (
    Schema,
    ValidationError,
    fields,
    post_load,
    validate,
    validates
)


class SendMoneySchema(Schema):

    # =====================================
    # Sender
    # =====================================

    sender_account_id = fields.UUID(
        required=True
    )

    # =====================================
    # Receiver
    # =====================================

    receiver_name = fields.String(
        required=True,
        validate=validate.Length(
            min=3,
            max=150
        )
    )

    receiver_account_number = fields.String(
        required=True,
        validate=validate.Length(
            min=8,
            max=30
        )
    )

    receiver_bank = fields.String(
        required=True,
        validate=validate.Length(
            min=2,
            max=100
        )
    )

    receiver_ifsc = fields.String(
        required=True,
        validate=validate.Length(
            min=1,
            max=13  # Allow up to 13 to handle accidental leading/trailing spaces (stripped in @post_load)
        )
    )

    # =====================================
    # Transaction
    # =====================================

    amount = fields.Decimal(
        required=True,
        as_string=True,
        validate=validate.Range(
            min=1
        )
    )

    remarks = fields.String(
        required=False,
        load_default="",
        validate=validate.Length(
            max=255
        )
    )

    transaction_source = fields.String(
        required=True,
        validate=validate.OneOf(
            [
                "UPI",
                "IMPS",
                "NEFT",
                "RTGS"
            ]
        )
    )

    # =====================================
    # Custom Validators
    # =====================================

    @validates("receiver_name")
    def validate_receiver_name(
        self,
        value,
        **kwargs
    ):

        value = value.strip()

        if len(value) < 3:
            raise ValidationError(
                "Receiver name is too short."
            )

    @validates("receiver_ifsc")
    def validate_ifsc(
        self,
        value,
        **kwargs
    ):
        # Normalize first: strip whitespace and uppercase
        normalized = value.strip().upper()

        # Accept standard IFSC format: 4 letters + 7 alphanumeric chars (11 total)
        # The 5th char is typically '0' in real IFSCs but we allow any char for flexibility
        pattern = r"^[A-Z]{4}[A-Z0-9]{7}$"

        if not re.match(pattern, normalized):
            raise ValidationError(
                "Invalid IFSC code. Must be 11 characters: 4 letters followed by 7 alphanumeric characters (e.g. HDFC0001234)."
            )

    @post_load
    def normalize_fields(self, data, **kwargs):
        """Normalize IFSC and text fields after loading to ensure clean data reaches the service."""
        if "receiver_ifsc" in data:
            data["receiver_ifsc"] = data["receiver_ifsc"].strip().upper()
        if "receiver_name" in data:
            data["receiver_name"] = data["receiver_name"].strip()
        if "receiver_account_number" in data:
            data["receiver_account_number"] = data["receiver_account_number"].strip()
        if "receiver_bank" in data:
            data["receiver_bank"] = data["receiver_bank"].strip()
        return data