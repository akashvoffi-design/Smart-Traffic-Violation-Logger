"""
Pytest configuration and shared fixtures.
"""
import pytest
from app import create_app
from app.extensions import db as _db
from app.models import User, Violation
from datetime import date


TEST_CONFIG = {
    "TESTING": True,
    "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    "WTF_CSRF_ENABLED": False,  # disable CSRF in tests
    "SECRET_KEY": "test-secret",
    "PUBLIC_BASE_URL": "http://localhost:5173",
}


@pytest.fixture(scope="session")
def app():
    app = create_app(config_override=TEST_CONFIG)
    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()


@pytest.fixture(scope="session")
def client(app):
    return app.test_client()


@pytest.fixture(scope="session")
def officer(app):
    """Create a test officer once for the session."""
    with app.app_context():
        u = User(username="testofficer")
        u.set_password("Test@1234")
        _db.session.add(u)
        _db.session.commit()
        return u.id  # return id so we can re-query in tests


@pytest.fixture()
def logged_in(client, officer, app):
    """Log in the test officer and yield the client; log out after."""
    client.post(
        "/api/auth/login",
        json={"username": "testofficer", "password": "Test@1234"},
    )
    yield client
    client.post("/api/auth/logout")
