from marshmallow import Schema, fields, validate


# ==========================================
# Customer Signup Schema
# ==========================================

class CustomerSignupSchema(Schema):

    full_name = fields.String(
        required=True,
        validate=validate.Length(min=3, max=100)
    )

    email = fields.Email(required=True)

    mobile_number = fields.String(
        required=True,
        validate=validate.Length(equal=10)
    )

    government_id = fields.String(required=True)

    date_of_birth = fields.Date(required=True)

    address = fields.String(required=True)

    password = fields.String(
        required=True,
        validate=validate.Length(min=8)
    )

    confirm_password = fields.String(required=True)


# ==========================================
# Employee Signup Schema
# ==========================================

class EmployeeSignupSchema(Schema):

    full_name = fields.String(
        required=True,
        validate=validate.Length(min=3, max=100)
    )

    email = fields.Email(required=True)

    mobile_number = fields.String(
        required=True,
        validate=validate.Length(equal=10)
    )

    government_id = fields.String(required=True)

    date_of_birth = fields.Date(required=True)

    address = fields.String(required=True)

    password = fields.String(
        required=True,
        validate=validate.Length(min=8)
    )

    confirm_password = fields.String(required=True)


# ==========================================
# Login Schema
# ==========================================

class LoginSchema(Schema):

    email = fields.Email(
        required=True
    )

    password = fields.String(
        required=True
    )

    role = fields.String(
        required=True,
        validate=validate.OneOf(
            [
                "customer",
                "employee"
            ]
        )
    )