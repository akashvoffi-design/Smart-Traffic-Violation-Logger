"""
Public read-only route — no authentication required.
GET /public/challans/<token>
Exposes only safe fields; never exposes officer data or internal IDs.
"""
from flask import Blueprint, jsonify
from app.models import Violation

public_bp = Blueprint("public", __name__)


@public_bp.route("/challans/<string:token>", methods=["GET"])
def public_challan(token):
    violation = Violation.query.filter(
        (Violation.public_token == token) |
        (Violation.challan_number.ilike(token))
    ).first()
    if not violation:
        return jsonify({"error": "Challan not found."}), 404
    return jsonify({"challan": violation.to_public_dict()}), 200


@public_bp.route("/lookup", methods=["GET"])
def public_lookup():
    from flask import request
    from app.utils.validators import normalize_vehicle_number

    challan_num = request.args.get("challan_number", "").strip()
    vehicle_num = request.args.get("vehicle_number", "").strip()

    if challan_num:
        v = Violation.query.filter(Violation.challan_number.ilike(challan_num)).first()
        if not v:
            return jsonify({"error": "Challan not found with that number.", "results": []}), 404
        return jsonify({"results": [v.to_public_dict()]}), 200

    if vehicle_num:
        norm = normalize_vehicle_number(vehicle_num)
        violations = (
            Violation.query.filter(Violation.vehicle_number.like(f"%{norm}%"))
            .order_by(Violation.created_at.desc())
            .all()
        )
        if not violations:
            return jsonify({"message": "No violations found for this vehicle.", "results": []}), 200
        return jsonify({
            "vehicle_number": norm,
            "results": [v.to_public_dict() for v in violations]
        }), 200

    return jsonify({"error": "Please provide a challan_number or vehicle_number."}), 400

