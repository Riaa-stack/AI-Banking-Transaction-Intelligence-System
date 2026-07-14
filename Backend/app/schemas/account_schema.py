from marshmallow import Schema, fields, validate


class BankAccountSchema(Schema):

    bank_name = fields.String(
        required=True,
        validate=validate.Length(min=2, max=100)
    )

    account_holder_name = fields.String(
        required=True,
        validate=validate.Length(min=3, max=150)
    )

    account_number = fields.String(
        required=True,
        validate=validate.Length(min=8, max=30)
    )

    ifsc_code = fields.String(
        required=True,
        validate=validate.Length(equal=11)
    )

    branch_name = fields.String(
        required=True,
        validate=validate.Length(min=2, max=150)
    )

    account_type = fields.String(
        required=True,
        validate=validate.OneOf(
            ["Savings", "Current"]
        )
    )

    current_balance = fields.Float(
        required=True
    )

    is_primary = fields.Boolean(
        load_default=False
    )