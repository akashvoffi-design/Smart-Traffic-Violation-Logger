<div align="center">

# 🚦 Smart Traffic Violation Logger

**A premium full-stack web app for digitizing traffic challans — built for officers, accessible to citizens.**

![Tech Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)
![Backend](https://img.shields.io/badge/Backend-Flask%20%2B%20SQLite-3775A9?style=for-the-badge&logo=python)
![License](https://img.shields.io/badge/License-MIT-D4AF37?style=for-the-badge)
![Tests](https://img.shields.io/badge/Tests-25%20Passing-34D399?style=for-the-badge)

> Officers log challans, search vehicle history, mark fines as paid, and share a **QR code** that opens a public read-only status page — all wrapped in a luxury **Obsidian & Champagne** dark UI.

</div>

---

## 📚 Table of Contents

| # | Section |
|---|---------|
| 1 | [✨ Features at a Glance](#-features-at-a-glance) |
| 2 | [🖥 App Preview — Demo Steps](#-app-preview--demo-steps) |
| 3 | [🚀 Quick Start](#-quick-start) |
| 4 | [🗂 Project Structure](#-project-structure) |
| 5 | [🔌 API Reference](#-api-reference) |
| 6 | [🎨 Design System](#-design-system--obsidian--champagne) |
| 7 | [🧪 Running Tests](#-running-tests) |
| 8 | [🔒 Security Notes](#-security-notes) |
| 9 | [⚠️ Payment Disclaimer](#️-payment-disclaimer) |
| 10 | [🗄️ Switching to MySQL](#️-switching-to-mysql) |
| 11 | [🛣 Planned Enhancements](#-planned-enhancements) |

---

## ✨ Features at a Glance

| 🏷 Feature | 📝 Description |
|------------|---------------|
| 🔐 **Officer Login** | Secure session-based auth with CSRF protection |
| 📋 **Log Challan** | Add vehicle number, violation type, location, date & fine |
| 📊 **Dashboard** | Animated stat cards — Total, Paid, Unpaid, Today |
| 🔍 **History & Search** | Filter by vehicle number, status, type, and date range |
| ✅ **Mark as Paid** | One-tap status update with iOS-style confirmation sheet |
| 📱 **QR Code Sharing** | Each challan gets a unique public link + scannable QR code |
| 🌐 **Public Status Page** | Citizens check status without logging in via `/c/<token>` |
| 🎨 **Premium Dark UI** | Glassmorphism, Dynamic Island toasts, Apple Wallet card style |

---

## 🖥 App Preview — Demo Steps

Follow these steps after starting both servers (see [Quick Start](#-quick-start)):

```
Step 1 → Open http://localhost:5173   (redirects to /login)
Step 2 → Log in with officer1 / Officer@123
Step 3 → Dashboard shows 4 animated stat cards + recent violations
Step 4 → Click "+ New Challan" to add a violation record
Step 5 → Open a Challan Detail to see the Wallet-style card with QR
Step 6 → Tap "Mark as Paid" → confirm in bottom sheet → badge turns green ✅
Step 7 → Copy the link or scan the QR → open in incognito (no login needed)
Step 8 → Use "History" to search, filter, and paginate all violations
```

> 💡 **Citizen Tip:** Anyone can check a challan status at `/c/<token>` — no account needed.

---

## 🚀 Quick Start

> **Prerequisites:** Python 3.10+, Node.js 18+, npm

### Step 1 — Backend (Flask + SQLite)

> ⚠️ Run **all** backend commands from inside the `backend/` folder.

```powershell
# 1. Navigate to the backend folder
cd smart-traffic-logger\backend

# 2. Create a Python virtual environment
py -3 -m venv .venv

# 3. Activate the virtual environment (PowerShell)
.\.venv\Scripts\Activate.ps1

# 4. Install all Python dependencies
pip install -r requirements.txt

# 5. Run database migrations (creates tables)
python -m flask --app run.py db upgrade

# 6. Seed demo data  →  creates officer1 + 20 sample violations
python -m flask --app run.py seed

# 7. Start Flask dev server
python -m flask --app run.py run --debug
```

✅ Flask is now running at **http://localhost:5000**

---

### Step 2 — Frontend (React + Vite)

Open a **second terminal** and run:

```powershell
# Navigate to frontend
cd smart-traffic-logger\frontend

# Install Node packages
npm install

# Start Vite dev server
npm run dev
```

✅ App is now live at **http://localhost:5173**

> Vite automatically proxies `/api` and `/public` requests → Flask on port 5000. No CORS issues.

---

### 🔑 Seed Login Credentials

| Field | Value |
|-------|-------|
| 👤 Username | `officer1` |
| 🔐 Password | `Officer@123` |

---

## 🗂 Project Structure

```
smart-traffic-logger/
│
├── 📁 backend/                         ← Python / Flask server
│   ├── 📁 app/
│   │   ├── __init__.py                 # App factory, blueprint registration
│   │   ├── extensions.py               # SQLAlchemy, Migrate, LoginManager, CSRF
│   │   ├── models.py                   # User + Violation ORM models
│   │   ├── 📁 routes/
│   │   │   ├── auth.py                 # /api/auth/* (login, logout, me)
│   │   │   ├── violations.py           # /api/violations/* (CRUD + filter)
│   │   │   ├── dashboard.py            # /api/dashboard/summary
│   │   │   └── public.py              # /public/challans/:token (no login)
│   │   ├── 📁 services/
│   │   │   └── qr_service.py          # QR PNG generation
│   │   └── 📁 utils/
│   │       └── validators.py           # Server-side input validation
│   ├── 📁 migrations/                  # Alembic DB migration files
│   ├── 📁 tests/
│   │   ├── conftest.py                 # Pytest fixtures (in-memory SQLite)
│   │   ├── test_auth.py                # 7 auth tests
│   │   └── test_violations.py          # 16 CRUD / filter / status / QR tests
│   ├── run.py                          # Entry point + seed CLI command
│   ├── requirements.txt
│   ├── .env                            # 🔒 Local secrets (NOT committed to git)
│   └── .env.example                    # Template — copy to .env to get started
│
├── 📁 frontend/                        ← React + Vite app
│   ├── 📁 src/
│   │   ├── 📁 api/
│   │   │   └── client.js              # Axios instance + CSRF auto-fetch
│   │   ├── 📁 components/
│   │   │   ├── AppShell.jsx           # Sidebar (desktop) + bottom tab bar (mobile)
│   │   │   ├── GlassCard.jsx          # Glassmorphism card with 3D tilt
│   │   │   ├── StatusBadge.jsx        # PAID / UNPAID badge
│   │   │   ├── AnimatedNumber.jsx     # Count-up animation for stats
│   │   │   ├── SkeletonLoader.jsx     # Shimmer placeholder while loading
│   │   │   └── BottomSheet.jsx        # iOS-style slide-up confirmation modal
│   │   ├── 📁 context/
│   │   │   ├── AuthContext.jsx        # Global user state + login / logout
│   │   │   └── ToastContext.jsx       # Dynamic Island toast notifications
│   │   ├── 📁 pages/
│   │   │   ├── Login.jsx              # /login — Officer sign-in & citizen link
│   │   │   ├── Dashboard.jsx          # /dashboard — Stats + recent violations
│   │   │   ├── AddViolation.jsx       # /violations/new — Add challan form
│   │   │   ├── History.jsx            # /violations — Search & filter history
│   │   │   ├── ChallanDetail.jsx      # /violations/:id — Receipt + QR tile
│   │   │   ├── SeeStatus.jsx          # /see-status — Public challan lookup
│   │   │   └── PublicStatus.jsx       # /c/:token — Public read-only receipt
│   │   ├── 📁 styles/
│   │   │   ├── tokens.css             # CSS design tokens (colors, spacing, etc.)
│   │   │   └── glass.css              # Glassmorphism utility classes
│   │   ├── App.jsx                    # Router + ProtectedRoute wrapper
│   │   └── main.jsx                   # React entry point
│   ├── index.html
│   ├── vite.config.js                 # Dev proxy → Flask 5000
│   └── package.json
│
├── .gitignore
└── README.md                          ← You are here 📍
```

---

## 🔌 API Reference

### 🔓 Public Endpoints (No login required)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/auth/csrf` | Fetch CSRF token (required before any POST) |
| `POST` | `/api/auth/login` | Create officer session |
| `GET` | `/public/challans/:token` | Read-only challan status by token or challan # |
| `GET` | `/public/lookup` | Search by `challan_number` or `vehicle_number` |

### 🔐 Protected Endpoints (Officer login required)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/auth/me` | Get current logged-in officer |
| `POST` | `/api/auth/logout` | End officer session |
| `POST` | `/api/violations` | Create challan *(status auto-set to UNPAID)* |
| `GET` | `/api/violations` | List challans with search / filter / pagination |
| `GET` | `/api/violations/:id` | Get a single challan detail |
| `PATCH` | `/api/violations/:id/status` | Mark UNPAID → PAID |
| `GET` | `/api/violations/:id/qr` | Get QR code PNG for sharing |
| `GET` | `/api/dashboard/summary` | Get totals: total / paid / unpaid / today |

---

## 🎨 Design System — Obsidian & Champagne

### Color Palette

| Token | Value | Purpose |
|-------|-------|---------|
| 🖤 Background | `#07080B` + radial gold/blue glow | Base canvas |
| 🪟 Surface Glass | `rgba(255,255,255,0.06)` + `blur(24px)` | Card backgrounds |
| 🥇 Gold Accent | `#F3E2A9 → #D4AF37 → #9C7A1E` gradient | Buttons, highlights |
| 📝 Text Primary | `#F5F1E8` | Main readable text |
| ✅ PAID | `#34D399` (emerald green) | Paid status badge |
| ❌ UNPAID | `#F26D6D` (coral red) | Unpaid status badge |
| 📐 Card Radius | `28px` (iOS continuous curve) | All card corners |

### ✨ Premium UI Features

- **Glassmorphism** — frosted glass cards with specular edge highlight on every surface
- **Dynamic Island Toasts** — pill-shaped spring animations (expand → collapse) for notifications
- **iOS Bottom Sheet** — slide-up confirmation modal with drag handle
- **Apple Wallet Card** — challan detail styled as a physical card with perforated divider
- **Count-Up Numbers** — animated stat counters on dashboard load
- **Staggered List Reveal** — rows appear with 40ms delay each for a fluid feel
- **Skeleton Shimmer** — glowing placeholder cards while data is loading
- **Press-Scale Feedback** — all buttons and cards scale to `0.97` on tap/click
- **Segmented Control** — All / Unpaid / Paid filter tabs
- **Glass Sidebar** (desktop) + **Floating Glass Tab Bar** (mobile)
- **Framer Motion** spring physics: stiffness `320` / damping `28`

---

## 🧪 Running Tests

```powershell
cd backend
.\.venv\Scripts\python -m pytest tests/ -v
```

### ✅ 25 Tests Covering

| Area | What's Tested |
|------|--------------|
| 🔐 Auth | Login, logout, wrong password, missing fields |
| 📋 Violations | Create valid + invalid (missing fields, future date, bad plate, zero fine) |
| 🔒 Access Control | Unauthenticated access returns `401` |
| 🔍 Search & Filters | Vehicle number, type, status, date range |
| ✅ Status Update | UNPAID → PAID once; second attempt returns `400` |
| 📱 QR Code | Endpoint returns valid `image/png` |
| 🌐 Public Endpoint | Returns only safe fields; `404` for bad token |
| 🔍 Public Lookup | Search by challan number and vehicle number |
| 📊 Dashboard | Summary totals are accurate |

---

## 🔒 Security Notes

| Feature | Implementation |
|---------|----------------|
| 🔑 Password Hashing | Werkzeug **PBKDF2-SHA256** |
| 🛡 Session Auth | Flask-Login `@login_required` → returns `401 JSON` (not a redirect) |
| 🔐 CSRF Protection | `X-CSRFToken` header required on all `POST` / `PATCH` requests |
| 🎲 Secure Tokens | `public_token` uses `secrets.token_urlsafe(32)` — internal IDs never exposed |
| 📋 Public Whitelist | Returns only: `challan_number`, `vehicle_number`, `violation_type`, `location`, `violation_date`, `fine_amount`, `status` |
| 🔢 Decimal Safety | `fine_amount` uses `Decimal` type — no floating-point rounding errors |

---

## ⚠️ Payment Disclaimer

> The **"Mark as Paid"** button performs a **manual status update only.**
>
> Real-world payment processing requires a trusted payment provider (Razorpay, Stripe, etc.) with **server-verified payment callbacks**. Never trust client-side payment status in production.

---

## 🗄️ Switching to MySQL

To use MySQL instead of SQLite, change `DATABASE_URL` in `backend/.env`:

```env
DATABASE_URL=mysql+pymysql://user:password@localhost/traffic_db
```

Then re-run migrations and seed:

```powershell
python -m flask --app run.py db upgrade
python -m flask --app run.py seed
```

### 📱 QR Code on Mobile (LAN Access)

For QR codes to work when scanned from a phone on the same Wi-Fi, update `PUBLIC_BASE_URL` in `backend/.env` to your machine's LAN IP:

```env
PUBLIC_BASE_URL=http://192.168.1.100:5173
```

---

## 🛣 Planned Enhancements

> These features are scoped for post-MVP development.

| Feature | Description |
|---------|-------------|
| 📄 PDF Export | Printable challan receipt as PDF |
| 📜 Audit History | Log every status change with timestamp |
| 📤 CSV Export | Bulk export of violation records |
| 📈 Analytics Charts | Violations by type, daily trend, peak days *(recharts already installed)* |
| 👥 Role-Based Access | Officer vs. Admin permissions |
| 📧 Email Notifications | Auto-notify citizens when a challan is issued |

---

<div align="center">

Made with ❤️ for modern traffic management.

**Flask · React · Vite · SQLite · Framer Motion**

</div>
