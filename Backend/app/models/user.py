from enum import Enum

from app.extensions import db
from app.models.base_model import BaseModel


class UserRole(Enum):
    CUSTOMER = "CUSTOMER"
    EMPLOYEE = "EMPLOYEE"


class User(BaseModel):

    __tablename__ = "users"

    full_name = db.Column(
        db.String(150),
        nullable=False
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False
    )

    mobile_number = db.Column(
        db.String(15),
        unique=True,
        nullable=False
    )

    government_id = db.Column(
        db.String(30),
        unique=True,
        nullable=False
    )

    date_of_birth = db.Column(
        db.Date,
        nullable=False
    )

    address = db.Column(
        db.Text,
        nullable=False
    )

    password = db.Column(
        db.String(255),
        nullable=False
    )

    role = db.Column(
        db.Enum(UserRole),
        nullable=False,
        default=UserRole.CUSTOMER
    )

    is_active = db.Column(
        db.Boolean,
        default=True
    )

    profile_image = db.Column(
        db.String(255)
    )

    def __repr__(self):
        return f"<User {self.email}>"