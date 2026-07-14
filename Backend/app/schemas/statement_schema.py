from marshmallow import (
    Schema,
    fields,
    validate,
    validates,
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
        validate=validate.OneOf(
            [
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
            ]
        )
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
    # Custom Validation
    # =====================================

    @validates("statement_end_date")
    def validate_dates(
        self,
        value,
        **kwargs
    ):

        start_date = self.context.get(
            "statement_start_date"
        )

        if start_date and value < start_date:

            raise ValidationError(
                "Statement end date cannot be before start date."
            )