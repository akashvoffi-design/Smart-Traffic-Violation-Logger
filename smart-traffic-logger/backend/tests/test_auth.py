"""Tests for authentication endpoints."""
import pytest


def test_login_success(client, officer):
    resp = client.post(
        "/api/auth/login",
        json={"username": "testofficer", "password": "Test@1234"},
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert "user" in data
    assert data["user"]["username"] == "testofficer"


def test_login_wrong_password(client):
    resp = client.post(
        "/api/auth/login",
        json={"username": "testofficer", "password": "WrongPass"},
    )
    assert resp.status_code == 401


def test_login_missing_fields(client):
    resp = client.post("/api/auth/login", json={"username": "testofficer"})
    assert resp.status_code == 400


def test_me_authenticated(logged_in):
    resp = logged_in.get("/api/auth/me")
    assert resp.status_code == 200
    assert resp.get_json()["user"]["username"] == "testofficer"


def test_me_unauthenticated(client):
    # Fresh client (not logged in)
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_logout(logged_in):
    resp = logged_in.post("/api/auth/logout")
    assert resp.status_code == 200


def test_officer_route_after_logout(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401
