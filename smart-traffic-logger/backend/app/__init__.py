"""
Smart Traffic Violation Logger - Backend Application
Flask app factory with blueprint registration.
"""
import os
from flask import Flask
from .extensions import db, migrate, login_manager, csrf
from dotenv import load_dotenv

load_dotenv()


def create_app(config_override=None):
    app = Flask(__name__)

    # ── Core config ──────────────────────────────────────────────
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", "sqlite:///traffic.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["WTF_CSRF_ENABLED"] = os.getenv("WTF_CSRF_ENABLED", "true").lower() == "true"
    app.config["PUBLIC_BASE_URL"] = os.getenv("PUBLIC_BASE_URL", "http://localhost:5173")

    if config_override:
        app.config.update(config_override)

    # ── Extensions ────────────────────────────────────────────────
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    csrf.init_app(app)

    # ── CORS (dev only) ───────────────────────────────────────────
    from flask_cors import CORS
    CORS(
        app,
        origins=["http://localhost:5173"],
        supports_credentials=True,
        allow_headers=["Content-Type", "X-CSRFToken"],
        methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    )

    # ── Blueprints ────────────────────────────────────────────────
    from .routes.auth import auth_bp
    from .routes.violations import violations_bp
    from .routes.dashboard import dashboard_bp
    from .routes.public import public_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(violations_bp, url_prefix="/api/violations")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(public_bp, url_prefix="/public")

    # ── Login manager config ──────────────────────────────────────
    login_manager.login_view = None  # return 401 JSON instead of redirect

    @login_manager.unauthorized_handler
    def unauthorized():
        from flask import jsonify
        return jsonify({"error": "Authentication required"}), 401

    @login_manager.user_loader
    def load_user(user_id):
        from .models import User
        return db.session.get(User, int(user_id))

    return app
