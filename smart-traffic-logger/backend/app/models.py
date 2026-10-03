"""
SQLAlchemy models for the Smart Traffic Violation Logger.
"""
import secrets
from datetime import datetime, timezone
from decimal import Decimal

from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

from .extensions import db


class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    violations = db.relationship("Violation", back_populates="officer", lazy="dynamic")

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


def _generate_challan_number():
    from datetime import date
    today = date.today().strftime("%Y%m%d")
    suffix = secrets.token_hex(3).upper()
    return f"TV-{today}-{suffix}"


def _generate_public_token():
    return secrets.token_urlsafe(32)


class Violation(db.Model):
    __tablename__ = "violations"

    ALLOWED_VIOLATION_TYPES = [
        "No Helmet",
        "Overspeeding",
        "Signal Jump",
        "Wrong Parking",
        "No Seatbelt",
        "Wrong Side Driving",
        "Using Phone While Driving",
        "Other",
    ]

    id = db.Column(db.Integer, primary_key=True)
    challan_number = db.Column(
        db.String(40), unique=True, nullable=False, default=_generate_challan_number
    )
    public_token = db.Column(
        db.String(64), unique=True, nullable=False, default=_generate_public_token
    )
    vehicle_number = db.Column(db.String(20), nullable=False, index=True)
    violation_type = db.Column(db.String(80), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    violation_date = db.Column(db.Date, nullable=False)
    fine_amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(
        db.Enum("UNPAID", "PAID", name="violation_status"),
        default="UNPAID",
        nullable=False,
    )
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    paid_at = db.Column(db.DateTime, nullable=True)

    officer = db.relationship("User", back_populates="violations")

    def to_dict(self, include_officer=False):
        data = {
            "id": self.id,
            "challan_number": self.challan_number,
            "public_token": self.public_token,
            "vehicle_number": self.vehicle_number,
            "violation_type": self.violation_type,
            "location": self.location,
            "violation_date": self.violation_date.isoformat() if self.violation_date else None,
            "fine_amount": str(self.fine_amount),
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
        }
        if include_officer:
            data["officer"] = {
                "id": self.officer.id,
                "username": self.officer.username,
            }
        return data

    def to_public_dict(self):
        """Restricted dict for the public /c/:token page. No officer or ID info."""
        return {
            "challan_number": self.challan_number,
            "vehicle_number": self.vehicle_number,
            "violation_type": self.violation_type,
            "location": self.location,
            "violation_date": self.violation_date.isoformat() if self.violation_date else None,
            "fine_amount": str(self.fine_amount),
            "status": self.status,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
        }
