import uuid
from enum import Enum

from sqlalchemy.dialects.postgresql import UUID

from app.extensions import db
from app.models.base_model import BaseModel


class MessageType(Enum):
    USER = "User"
    AI = "AI"


class Language(Enum):
    ENGLISH = "English"
    MARATHI = "Marathi"


class ChatHistory(BaseModel):

    __tablename__ = "chat_history"

    conversation_id = db.Column(
        UUID(as_uuid=True),
        default=uuid.uuid4,
        nullable=False
    )

    customer_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id"),
        nullable=False
    )

    message_type = db.Column(
        db.Enum(MessageType),
        nullable=False
    )

    language = db.Column(
        db.Enum(Language),
        default=Language.ENGLISH
    )

    message = db.Column(
        db.Text,
        nullable=False
    )

    customer = db.relationship(
        "User",
        backref=db.backref(
            "chat_history",
            lazy=True,
            cascade="all, delete-orphan"
        )
    )

    def __repr__(self):
        return f"<ChatHistory {self.id}>"