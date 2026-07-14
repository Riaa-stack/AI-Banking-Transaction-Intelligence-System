import re

from marshmallow import (
    Schema,
    ValidationError,
    fields,
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
            min=11,
            max=11
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

        pattern = r"^[A-Z]{4}0[A-Z0-9]{6}$"

        if not re.match(
            pattern,
            value.upper()
        ):
            raise ValidationError(
                "Invalid IFSC code."
            )