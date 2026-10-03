"""
Violations CRUD routes.
POST   /api/violations           — create
GET    /api/violations           — list with search/filter/pagination
GET    /api/violations/<id>      — detail
PATCH  /api/violations/<id>/status — mark paid
GET    /api/violations/<id>/qr   — QR PNG
"""
from datetime import datetime, timezone, date
from flask import Blueprint, request, jsonify, send_file
from flask_login import login_required, current_user
import io

from app.extensions import db
from app.models import Violation
from app.utils.validators import (
    validate_violation_payload,
    normalize_vehicle_number,
)
from app.services.qr_service import generate_qr_png

violations_bp = Blueprint("violations", __name__)


@violations_bp.route("", methods=["POST"])
@login_required
def create_violation():
    data = request.get_json(silent=True) or {}
    cleaned, errors = validate_violation_payload(data)
    if errors:
        return jsonify({"error": "Validation failed.", "fields": errors}), 400

    violation = Violation(
        vehicle_number=cleaned["vehicle_number"],
        violation_type=cleaned["violation_type"],
        location=cleaned["location"],
        violation_date=cleaned["violation_date"],
        fine_amount=cleaned["fine_amount"],
        status="UNPAID",
        created_by=current_user.id,
    )
    db.session.add(violation)
    db.session.commit()
    return jsonify({"message": "Challan created.", "violation": violation.to_dict()}), 201


@violations_bp.route("", methods=["GET"])
@login_required
def list_violations():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 10, type=int), 100)

    query = Violation.query

    # Vehicle number search (partial, normalized)
    vehicle = request.args.get("vehicle_number", "").strip()
    if vehicle:
        normalized = normalize_vehicle_number(vehicle)
        query = query.filter(Violation.vehicle_number.like(f"%{normalized}%"))

    # Status filter
    status = request.args.get("status", "").upper()
    if status in ("PAID", "UNPAID"):
        query = query.filter(Violation.status == status)

    # Violation type filter
    vtype = request.args.get("type", "").strip()
    if vtype:
        query = query.filter(Violation.violation_type == vtype)

    # Date range filter
    date_from = request.args.get("date_from", "").strip()
    date_to = request.args.get("date_to", "").strip()
    if date_from:
        try:
            query = query.filter(Violation.violation_date >= date.fromisoformat(date_from))
        except ValueError:
            return jsonify({"error": "Invalid date_from format (YYYY-MM-DD)."}), 400
    if date_to:
        try:
            query = query.filter(Violation.violation_date <= date.fromisoformat(date_to))
        except ValueError:
            return jsonify({"error": "Invalid date_to format (YYYY-MM-DD)."}), 400

    query = query.order_by(Violation.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "violations": [v.to_dict() for v in pagination.items],
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev,
        },
    }), 200


@violations_bp.route("/<int:vid>", methods=["GET"])
@login_required
def get_violation(vid):
    violation = db.session.get(Violation, vid)
    if not violation:
        return jsonify({"error": "Challan not found."}), 404
    return jsonify({"violation": violation.to_dict(include_officer=True)}), 200


@violations_bp.route("/<int:vid>/status", methods=["PATCH"])
@login_required
def update_status(vid):
    violation = db.session.get(Violation, vid)
    if not violation:
        return jsonify({"error": "Challan not found."}), 404
    if violation.status == "PAID":
        return jsonify({"error": "Challan is already marked as PAID."}), 400

    violation.status = "PAID"
    violation.paid_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify({"message": "Challan marked as PAID.", "violation": violation.to_dict()}), 200


@violations_bp.route("/<int:vid>/qr", methods=["GET"])
@login_required
def get_qr(vid):
    violation = db.session.get(Violation, vid)
    if not violation:
        return jsonify({"error": "Challan not found."}), 404

    png_bytes = generate_qr_png(violation.public_token)
    return send_file(
        io.BytesIO(png_bytes),
        mimetype="image/png",
        as_attachment=False,
        download_name=f"qr_{violation.challan_number}.png",
    )
