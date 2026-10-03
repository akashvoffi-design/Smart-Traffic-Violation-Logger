"""Tests for violations CRUD, filters, status update, QR, and public endpoint."""
import pytest
from datetime import date


VALID_PAYLOAD = {
    "vehicle_number": "TN01AB1234",
    "violation_type": "No Helmet",
    "location": "Anna Salai, Chennai",
    "violation_date": str(date.today()),
    "fine_amount": "500.00",
}


# ── Create ──────────────────────────────────────────────────────────────────

def test_create_violation_success(logged_in):
    resp = logged_in.post("/api/violations", json=VALID_PAYLOAD)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["violation"]["status"] == "UNPAID"
    assert data["violation"]["vehicle_number"] == "TN01AB1234"


def test_create_violation_missing_field(logged_in):
    bad = {**VALID_PAYLOAD}
    del bad["location"]
    resp = logged_in.post("/api/violations", json=bad)
    assert resp.status_code == 400
    assert "fields" in resp.get_json()


def test_create_violation_future_date(logged_in):
    bad = {**VALID_PAYLOAD, "violation_date": "2099-01-01"}
    resp = logged_in.post("/api/violations", json=bad)
    assert resp.status_code == 400


def test_create_violation_invalid_plate(logged_in):
    bad = {**VALID_PAYLOAD, "vehicle_number": "INVALID"}
    resp = logged_in.post("/api/violations", json=bad)
    assert resp.status_code == 400


def test_create_violation_zero_fine(logged_in):
    bad = {**VALID_PAYLOAD, "fine_amount": "0"}
    resp = logged_in.post("/api/violations", json=bad)
    assert resp.status_code == 400


def test_create_violation_unauthenticated(client):
    resp = client.post("/api/violations", json=VALID_PAYLOAD)
    assert resp.status_code == 401


# ── List / search ────────────────────────────────────────────────────────────

def test_list_violations(logged_in):
    resp = logged_in.get("/api/violations")
    assert resp.status_code == 200
    assert "violations" in resp.get_json()
    assert "pagination" in resp.get_json()


def test_search_by_vehicle_number(logged_in):
    resp = logged_in.get("/api/violations?vehicle_number=TN01AB1234")
    assert resp.status_code == 200
    results = resp.get_json()["violations"]
    assert all("TN01AB1234" in v["vehicle_number"] for v in results)


def test_filter_by_status(logged_in):
    resp = logged_in.get("/api/violations?status=UNPAID")
    assert resp.status_code == 200
    for v in resp.get_json()["violations"]:
        assert v["status"] == "UNPAID"


def test_filter_by_type(logged_in):
    resp = logged_in.get("/api/violations?type=No Helmet")
    assert resp.status_code == 200
    for v in resp.get_json()["violations"]:
        assert v["violation_type"] == "No Helmet"


# ── Status update ─────────────────────────────────────────────────────────────

def _create_and_get_id(client):
    resp = client.post("/api/violations", json=VALID_PAYLOAD)
    return resp.get_json()["violation"]["id"]


def test_status_update_unpaid_to_paid(logged_in):
    vid = _create_and_get_id(logged_in)
    resp = logged_in.patch(f"/api/violations/{vid}/status")
    assert resp.status_code == 200
    assert resp.get_json()["violation"]["status"] == "PAID"
    assert resp.get_json()["violation"]["paid_at"] is not None


def test_status_update_already_paid(logged_in):
    vid = _create_and_get_id(logged_in)
    logged_in.patch(f"/api/violations/{vid}/status")  # first time
    resp = logged_in.patch(f"/api/violations/{vid}/status")  # second time
    assert resp.status_code == 400


# ── QR endpoint ───────────────────────────────────────────────────────────────

def test_qr_returns_png(logged_in):
    vid = _create_and_get_id(logged_in)
    resp = logged_in.get(f"/api/violations/{vid}/qr")
    assert resp.status_code == 200
    assert resp.content_type == "image/png"


# ── Public endpoint ───────────────────────────────────────────────────────────

def test_public_challan_returns_safe_fields(logged_in, client):
    create_resp = logged_in.post("/api/violations", json=VALID_PAYLOAD)
    token = create_resp.get_json()["violation"]["public_token"]

    resp = client.get(f"/public/challans/{token}")
    assert resp.status_code == 200
    data = resp.get_json()["challan"]

    # Must have required public fields
    for field in ["challan_number", "vehicle_number", "violation_type", "status", "fine_amount"]:
        assert field in data

    # Must NOT expose private fields
    for private_field in ["id", "created_by", "public_token"]:
        assert private_field not in data


def test_public_challan_bad_token(client):
    resp = client.get("/public/challans/nonexistent-bad-token-xyz")
    assert resp.status_code == 404


# ── Dashboard ─────────────────────────────────────────────────────────────────

def test_dashboard_summary(logged_in):
    resp = logged_in.get("/api/dashboard/summary")
    assert resp.status_code == 200
    data = resp.get_json()
    for key in ("total", "paid", "unpaid", "today"):
        assert key in data


# ── Public Lookup / See Status ───────────────────────────────────────────────

def test_public_challan_by_challan_number(logged_in, client):
    create_resp = logged_in.post("/api/violations", json=VALID_PAYLOAD)
    cnum = create_resp.get_json()["violation"]["challan_number"]

    resp = client.get(f"/public/challans/{cnum}")
    assert resp.status_code == 200
    assert resp.get_json()["challan"]["challan_number"] == cnum


def test_public_lookup_endpoints(logged_in, client):
    create_resp = logged_in.post("/api/violations", json=VALID_PAYLOAD)
    cnum = create_resp.get_json()["violation"]["challan_number"]
    vnum = create_resp.get_json()["violation"]["vehicle_number"]

    # Lookup by challan number
    resp = client.get(f"/public/lookup?challan_number={cnum}")
    assert resp.status_code == 200
    assert len(resp.get_json()["results"]) == 1
    assert resp.get_json()["results"][0]["challan_number"] == cnum

    # Lookup by vehicle number
    resp = client.get(f"/public/lookup?vehicle_number={vnum}")
    assert resp.status_code == 200
    assert len(resp.get_json()["results"]) >= 1

    # Lookup empty params
    resp = client.get("/public/lookup")
    assert resp.status_code == 400

