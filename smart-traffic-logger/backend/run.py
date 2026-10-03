"""
Entry point for the Flask development server.
Run with: python -m flask --app run.py run --debug

Also exposes CLI commands:
  flask --app run.py db upgrade   — run migrations
  flask --app run.py seed         — seed demo data
"""
import click
from app import create_app
from app.extensions import db

app = create_app()


@app.cli.command("seed")
def seed():
    """Seed the database with one demo officer and 20 sample violations."""
    from datetime import date, timedelta
    import random
    from app.models import User, Violation

    click.echo("Seeding database…")

    # ── Officer ──────────────────────────────────────────────────
    officer = User.query.filter_by(username="officer1").first()
    if not officer:
        officer = User(username="officer1")
        officer.set_password("Officer@123")
        db.session.add(officer)
        db.session.commit()
        click.echo("  Created officer1")
    else:
        click.echo("  officer1 already exists — skipping user creation")

    # ── Sample violations ─────────────────────────────────────────
    vehicles = [
        "TN01AB1234", "MH02CD5678", "KA03EF9012",
        "DL04GH3456", "GJ05IJ7890", "UP06KL2345",
        "RJ07MN6789", "WB08OP0123",
    ]
    types = Violation.ALLOWED_VIOLATION_TYPES
    locations = [
        "Anna Salai, Chennai", "MG Road, Bangalore", "Marine Lines, Mumbai",
        "Connaught Place, Delhi", "CG Road, Ahmedabad", "Hazratganj, Lucknow",
        "MI Road, Jaipur", "Park Street, Kolkata",
    ]

    count = 0
    base_date = date.today()
    for i in range(20):
        days_back = random.randint(0, 90)
        vdate = base_date - timedelta(days=days_back)
        status = random.choice(["UNPAID", "UNPAID", "PAID"])  # skew unpaid

        from datetime import datetime, timezone
        paid_at = None
        if status == "PAID":
            paid_at = datetime.now(timezone.utc)

        v = Violation(
            vehicle_number=random.choice(vehicles),
            violation_type=random.choice(types),
            location=random.choice(locations),
            violation_date=vdate,
            fine_amount=random.choice([500, 1000, 2000, 5000, 10000]),
            status=status,
            created_by=officer.id,
            paid_at=paid_at,
        )
        db.session.add(v)
        count += 1

    db.session.commit()
    click.echo(f"  Seeded {count} violations.")
    click.echo("Done! Login: officer1 / Officer@123")


if __name__ == "__main__":
    app.run(debug=True)
