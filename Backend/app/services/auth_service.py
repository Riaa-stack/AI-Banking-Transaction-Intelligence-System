from flask_jwt_extended import create_access_token

from app.extensions import db, bcrypt
from app.models.user import User, UserRole
from app.models.bank_account import (
    BankAccount,
    AccountType,
    AccountStatus
)

class AuthService:

    # ==========================================
    # Customer Registration
    # ==========================================

    @staticmethod
    def register_customer(data):

        try:

            # Check Email
            if User.query.filter_by(
                email=data["email"]
            ).first():
                return False, "Email already registered."

            # Check Mobile Number
            if User.query.filter_by(
                mobile_number=data["mobile_number"]
            ).first():
                return False, "Mobile number already registered."

            # Check Government ID
            if User.query.filter_by(
                government_id=data["government_id"]
            ).first():
                return False, "Government ID already registered."

            # Password Match
            if data["password"] != data["confirm_password"]:
                return False, "Passwords do not match."

            # Hash Password
            hashed_password = bcrypt.generate_password_hash(
                data["password"]
            ).decode("utf-8")

            customer = User(

                full_name=data["full_name"],

                email=data["email"],

                mobile_number=data["mobile_number"],

                government_id=data["government_id"],

                date_of_birth=data["date_of_birth"],

                address=data["address"],

                password=hashed_password,

                role=UserRole.CUSTOMER,

                is_active=True

            )

            # Save customer first
            db.session.add(customer)
            db.session.flush()

            # Create primary bank account
            bank_account = BankAccount(

                user_id=customer.id,

                bank_name=data["bank_name"],

                account_holder_name=data["account_holder_name"],

                account_number=data["account_number"],

                ifsc_code=data["ifsc_code"],

                branch_name=data["branch_name"],

                account_type=AccountType(data["account_type"]),

                current_balance=data["current_balance"],

                is_primary=True,

                account_status=AccountStatus.ACTIVE

            )

            db.session.add(bank_account)

            db.session.commit()

            return True, customer

        except Exception as e:

            db.session.rollback()

            return False, str(e)

    # ==========================================
    # Employee Registration
    # ==========================================

    @staticmethod
    def register_employee(data):

        try:

            # Check Email
            if User.query.filter_by(
                email=data["email"]
            ).first():
                return False, "Email already registered."

            # Check Mobile Number
            if User.query.filter_by(
                mobile_number=data["mobile_number"]
            ).first():
                return False, "Mobile number already registered."

            # Check Government ID
            if User.query.filter_by(
                government_id=data["government_id"]
            ).first():
                return False, "Government ID already registered."

            # Password Match
            if data["password"] != data["confirm_password"]:
                return False, "Passwords do not match."

            # Hash Password
            hashed_password = bcrypt.generate_password_hash(
                data["password"]
            ).decode("utf-8")

            employee = User(

                full_name=data["full_name"],

                email=data["email"],

                mobile_number=data["mobile_number"],

                government_id=data["government_id"],

                date_of_birth=data["date_of_birth"],

                address=data["address"],

                password=hashed_password,

                role=UserRole.EMPLOYEE,

                is_active=True

            )

            db.session.add(employee)
            db.session.commit()

            return True, employee

        except Exception as e:

            db.session.rollback()

            return False, str(e)

    # ==========================================
    # Login
    # ==========================================

    @staticmethod
    def login(data):

        try:

            # =====================================
            # Find User
            # =====================================

            user = User.query.filter_by(
                email=data["email"]
            ).first()

            if not user:
                return False, "Invalid email or password."

            # =====================================
            # Verify Password
            # =====================================

            if not bcrypt.check_password_hash(
                user.password,
                data["password"]
            ):
                return False, "Invalid email or password."

            # =====================================
            # Verify Role
            # =====================================
            print("================================")
            print("Database Role :", user.role)
            print("Database Role Value :", repr(user.role.value))
            print("Frontend Role :", repr(data["role"]))

            db_role = str(user.role.value).lower()
            request_role = str(data["role"]).lower()

            print("Normalized DB Role :", db_role)
            print("Normalized Request Role :", request_role)
            print("Equal :", db_role == request_role)
            print("================================")

            if db_role != request_role:
                return False, "Invalid role selected."

            # =====================================
            # Account Status
            # =====================================

            if not user.is_active:
                return False, "Your account has been deactivated."

            # =====================================
            # Generate JWT
            # =====================================

            access_token = create_access_token(

                identity=str(user.id),

                additional_claims={

                    "email": user.email,

                    "role": user.role.value

                }

            )

            # =====================================
            # Success Response
            # =====================================

            return True, {

                "access_token": access_token,

                "user": {

                    "id": str(user.id),

                    "full_name": user.full_name,

                    "email": user.email,

                    "mobile_number": user.mobile_number,

                    "role": user.role.value,

                    "is_active": user.is_active

                }

            }

        except Exception as e:

            return False, str(e)