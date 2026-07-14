from marshmallow import (
    Schema,
    fields,
    validate
)


class CreateNotificationSchema(Schema):

    user_id = fields.UUID(
        required=True
    )

    title = fields.String(
        required=True,
        validate=validate.Length(
            min=3,
            max=150
        )
    )

    message = fields.String(
        required=True,
        validate=validate.Length(
            min=5,
            max=1000
        )
    )

    notification_type = fields.String(
        required=True,
        validate=validate.OneOf(
            [
                "Transaction",
                "Fraud",
                "Statement",
                "Loan",
                "System"
            ]
        )
    )

    priority = fields.String(
        required=False,
        load_default="Low",
        validate=validate.OneOf(
            [
                "Low",
                "Medium",
                "High"
            ]
        )
    )