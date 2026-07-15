from marshmallow import Schema, fields, validate


# ==========================================
# Customer Signup Schema
# ==========================================

class CustomerSignupSchema(Schema):

    # ======================================
    # Personal Information
    # ======================================

    full_name = fields.String(
        required=True,
        validate=validate.Length(min=3, max=100)
    )

    email = fields.Email(
        required=True
    )

    mobile_number = fields.String(
        required=True,
        validate=validate.Length(equal=10)
    )

    government_id = fields.String(
        required=True
    )

    date_of_birth = fields.Date(
        required=True
    )

    address = fields.String(
        required=True
    )

    # ======================================
    # Bank Information
    # ======================================

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
            [
                "Savings",
                "Current"
            ]
        )
    )

    current_balance = fields.Float(
        load_default=0.0
    )

    # ======================================
    # Authentication
    # ======================================

    password = fields.String(
        required=True,
        validate=validate.Length(min=8)
    )

    confirm_password = fields.String(
        required=True
    )


# ==========================================
# Employee Signup Schema
# ==========================================

class EmployeeSignupSchema(Schema):

    full_name = fields.String(
        required=True,
        validate=validate.Length(min=3, max=100)
    )

    email = fields.Email(
        required=True
    )

    mobile_number = fields.String(
        required=True,
        validate=validate.Length(equal=10)
    )

    government_id = fields.String(
        required=True
    )

    date_of_birth = fields.Date(
        required=True
    )

    address = fields.String(
        required=True
    )

    password = fields.String(
        required=True,
        validate=validate.Length(min=8)
    )

    confirm_password = fields.String(
        required=True
    )


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