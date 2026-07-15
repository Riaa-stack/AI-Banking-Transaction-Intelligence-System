from marshmallow import (
    Schema,
    fields,
    validate,
    validates_schema,
    ValidationError
)


class UploadStatementSchema(Schema):

    # =====================================
    # Bank Account
    # =====================================

    account_id = fields.UUID(
        required=True
    )

    # =====================================
    # Statement Details
    # =====================================

    statement_month = fields.String(
        required=True,
        validate=validate.OneOf([
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ])
    )

    statement_year = fields.Integer(
        required=True,
        validate=validate.Range(
            min=2000,
            max=2100
        )
    )

    statement_start_date = fields.Date(
        required=True
    )

    statement_end_date = fields.Date(
        required=True
    )

    # =====================================
    # Validate Dates
    # =====================================

    @validates_schema
    def validate_dates(self, data, **kwargs):

        start_date = data.get("statement_start_date")
        end_date = data.get("statement_end_date")

        if (
            start_date
            and end_date
            and end_date < start_date
        ):

            raise ValidationError({
                "statement_end_date":
                    [
                        "Statement end date cannot be before start date."
                    ]
            })