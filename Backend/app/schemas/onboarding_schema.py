from marshmallow import Schema, fields, validate, validates_schema, ValidationError


class CustomerOnboardingSchema(Schema):

    full_name = fields.String(
        required=True,
        validate=validate.Length(min=3, max=150)
    )

    email = fields.Email(
        required=True
    )

    mobile_number = fields.String(
        required=True,
        validate=validate.Length(equal=10)
    )

    government_id = fields.String(
        required=True,
        validate=validate.Length(min=8, max=20)
    )

    date_of_birth = fields.Date(
        required=True
    )

    address = fields.String(
        required=True,
        validate=validate.Length(min=10, max=500)
    )

    password = fields.String(
        required=True,
        validate=validate.Length(min=8, max=100)
    )

    confirm_password = fields.String(
        required=True
    )

    @validates_schema
    def validate_passwords(self, data, **kwargs):

        if data["password"] != data["confirm_password"]:
            raise ValidationError(
                {
                    "confirm_password": [
                        "Passwords do not match."
                    ]
                }
            )