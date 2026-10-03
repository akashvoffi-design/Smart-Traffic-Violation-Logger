"""
Dashboard summary route.
GET /api/dashboard/summary
"""
from datetime import date, datetime, timezone
from flask import Blueprint, jsonify
from flask_login import login_required
from sqlalchemy import func

from app.extensions import db
from app.models import Violation

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/summary", methods=["GET"])
@login_required
def summary():
    total = db.session.query(func.count(Violation.id)).scalar() or 0
    paid = db.session.query(func.count(Violation.id)).filter(Violation.status == "PAID").scalar() or 0
    unpaid = db.session.query(func.count(Violation.id)).filter(Violation.status == "UNPAID").scalar() or 0

    today = date.today()
    today_count = (
        db.session.query(func.count(Violation.id))
        .filter(Violation.violation_date == today)
        .scalar()
        or 0
    )

    return jsonify({
        "total": total,
        "paid": paid,
        "unpaid": unpaid,
        "today": today_count,
    }), 200
