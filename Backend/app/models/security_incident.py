from app.extensions import db
from app.models.base_model import BaseModel


class SecurityIncident(BaseModel):
    __tablename__ = "security_incidents"

    incident_id = db.Column(db.String(50), unique=True, nullable=False)
    account_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("bank_accounts.id"), nullable=False)
    incident_type = db.Column(db.String(100), nullable=False)
    risk_score = db.Column(db.Integer, nullable=False)
    threat_level = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False)  # "ACTIVE", "CONTAINED", "RESOLVED"
    actions_taken = db.Column(db.Text, nullable=False)
    simulation = db.Column(db.Boolean, default=True)
    detected_at = db.Column(db.DateTime, nullable=False)
    contained_at = db.Column(db.DateTime, nullable=True)

    account = db.relationship(
        "BankAccount",
        backref=db.backref(
            "security_incidents",
            lazy=True,
            cascade="all, delete-orphan"
        )
    )

    def __repr__(self):
        return f"<SecurityIncident {self.incident_id}>"
