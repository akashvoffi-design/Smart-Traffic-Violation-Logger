"""
Input validators for server-side validation of violation data.
"""
import re
from datetime import date
from decimal import Decimal, InvalidOperation

from app.models import Violation

# Indian vehicle number plate patterns:
# Standard: XX00XX0000  or  XX-00-XX-0000
# BH series: 00BH0000X
PLATE_PATTERN = re.compile(
    r"^([A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{1,4}|[0-9]{2}BH[0-9]{4}[A-Z]{1,2})$"
)


def normalize_vehicle_number(raw: str) -> str:
    """Uppercase and strip spaces/hyphens from vehicle number."""
    return re.sub(r"[\s\-]", "", raw.upper())


def validate_vehicle_number(raw: str):
    """
    Normalize and validate the vehicle number.
    Returns (normalized, None) on success or (None, error_message).
    """
    if not raw or not raw.strip():
        return None, "Vehicle number is required."
    normalized = normalize_vehicle_number(raw)
    if not PLATE_PATTERN.match(normalized):
        return None, (
            f"'{normalized}' does not look like a valid Indian plate "
            "(e.g. TN01AB1234 or 22BH0001AA)."
        )
    return normalized, None


def validate_violation_type(vtype: str):
    if not vtype:
        return None, "Violation type is required."
    if vtype not in Violation.ALLOWED_VIOLATION_TYPES:
        return None, f"Violation type must be one of: {', '.join(Violation.ALLOWED_VIOLATION_TYPES)}"
    return vtype, None


def validate_location(location: str):
    if not location or not location.strip():
        return None, "Location is required."
    if len(location.strip()) > 200:
        return None, "Location must be 200 characters or fewer."
    return location.strip(), None


def validate_violation_date(date_str: str):
    if not date_str:
        return None, "Violation date is required."
    try:
        d = date.fromisoformat(date_str)
    except (ValueError, TypeError):
        return None, "Violation date must be a valid date in YYYY-MM-DD format."
    if d > date.today():
        return None, "Violation date cannot be in the future."
    return d, None


def validate_fine_amount(amount_raw):
    if amount_raw is None or str(amount_raw).strip() == "":
        return None, "Fine amount is required."
    try:
        amount = Decimal(str(amount_raw))
    except InvalidOperation:
        return None, "Fine amount must be a valid number."
    if amount <= 0:
        return None, "Fine amount must be greater than 0."
    # Max 2 decimal places
    if amount != round(amount, 2):
        return None, "Fine amount cannot have more than 2 decimal places."
    return amount, None


def validate_violation_payload(data: dict):
    """
    Validate all fields for creating a violation.
    Returns (cleaned_data, errors_dict).
    """
    errors = {}
    cleaned = {}

    vehicle_number, err = validate_vehicle_number(data.get("vehicle_number", ""))
    if err:
        errors["vehicle_number"] = err
    else:
        cleaned["vehicle_number"] = vehicle_number

    vtype, err = validate_violation_type(data.get("violation_type", ""))
    if err:
        errors["violation_type"] = err
    else:
        cleaned["violation_type"] = vtype

    location, err = validate_location(data.get("location", ""))
    if err:
        errors["location"] = err
    else:
        cleaned["location"] = location

    vdate, err = validate_violation_date(data.get("violation_date", ""))
    if err:
        errors["violation_date"] = err
    else:
        cleaned["violation_date"] = vdate

    fine, err = validate_fine_amount(data.get("fine_amount"))
    if err:
        errors["fine_amount"] = err
    else:
        cleaned["fine_amount"] = fine

    return cleaned, errors
