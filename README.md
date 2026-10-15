# TrustUpdate

**Secure Software Update Verification and Trust Management Platform**
IE3092 — Information Security Project, SLIIT

---

## What It Does

TrustUpdate helps individuals and small organisations decide whether a software update can be trusted **before installing it**. It aggregates four independent evidence checks:

| # | Check | Component |
|---|-------|-----------|
| 1 | File integrity (SHA-256 hash) | Component 2 |
| 2 | Digital signature validity | Component 3 |
| 3 | Publisher identity verification | Component 3 |
| 4 | Version/rollback detection | Component 3 |
| 5 | Trust history lookup | Component 4 |

The explainable Decision Engine produces one of four verdicts — **VERIFIED**, **SUSPICIOUS**, **UNTRUSTED**, or **UNKNOWN** — always with the concrete evidence behind it.

> **UNKNOWN ≠ UNTRUSTED.** Software with no trusted reference on record is `UNKNOWN`, not malicious.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + React Router v6 + Recharts + Axios |
| Backend | Node.js (LTS) + Express.js |
| Database | MySQL / MariaDB / SQLite + Sequelize ORM |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Crypto | Node.js built-in `crypto` (SHA-256 + RSA verify) |
| File upload | Multer (max 500 MB) |
| Security | helmet, express-rate-limit, express-validator |
| Testing | Jest (backend) + React Testing Library (frontend) |

---

## Project Structure

```
TrustUpdate/
├── client/                      # React SPA
│   ├── public/index.html
│   └── src/
│       ├── pages/               # 5 pages + Login
│       ├── components/          # Sidebar, VerdictBadge, EvidenceTable, KpiCard
│       ├── services/api.js      # Axios + JWT interceptor
│       └── __tests__/           # React Testing Library tests
├── server/                      # Node/Express API
│   ├── controllers/             # 6 controllers
│   ├── services/                # integrityService, authenticityService,
│   │                            # trustHistoryService, decisionEngine
│   ├── models/                  # 4 Sequelize models
│   ├── routes/                  # 6 route files
│   ├── middleware/auth.js       # JWT + role middleware
│   ├── __tests__/               # Jest test suite
│   ├── seed.js                  # Sample data
│   └── server.js                # App entry point
├── docs/
│   ├── SoftwareStack.md
│   ├── SystemArchitecture.md
│   └── TrustUpdate.postman_collection.json
├── .env.example
├── .gitignore
└── README.md
```

---

## Prerequisites

- **Node.js** ≥ 18 LTS
- **Database**: MySQL / MariaDB (e.g. XAMPP) on port 3306, or SQLite (zero-config, set `DB_DIALECT=sqlite`)
- **npm** ≥ 9

---

## Quick Start

### 1. Clone & configure environment

```bash
git clone <repo-url>
cd TrustUpdate

# Server environment
cp .env.example server/.env
# Edit server/.env — set your JWT_SECRET and database settings
```

Sample `.env` configuration for the server:
```ini
# Database: mysql or sqlite
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=trustupdate
DB_USER=root
DB_PASS=

# JWT Secret (use a strong random string >= 64 characters)
JWT_SECRET=replace_with_a_long_random_secret_at_least_64_chars
PORT=5000
NODE_ENV=development

# Optional: seed credentials (if omitted, random passwords will be generated)
SEED_ADMIN_PASSWORD=your_secure_admin_password
SEED_VIEWER_PASSWORD=your_secure_viewer_password
```

> **Note:** For zero-config local testing without MySQL, simply set `DB_DIALECT=sqlite` in `server/.env`.

### 2. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3. Seed the database

```bash
cd server && npm run seed
```

This initializes:
- Initial administrative and viewer user accounts (using `SEED_ADMIN_PASSWORD` / `SEED_VIEWER_PASSWORD` from `.env`, or cryptographically generated passwords displayed securely in the terminal)
- 9 trusted publisher records (Google, Microsoft, Mozilla, VideoLAN, etc.)
- 11 trusted software catalog entries
- 15 sample verification records (demonstrating all 4 verdict types: `VERIFIED`, `SUSPICIOUS`, `UNTRUSTED`, `UNKNOWN`)

### 4. Start the development servers

In two separate terminals (or run `run_trustupdate.bat` on Windows):

```bash
# Terminal 1 — API server (port 5000)
cd server && npm run dev

# Terminal 2 — React app (port 3000)
cd client && npm start
```

Open **http://localhost:3000** and sign in with your configured admin credentials (or click Sign Up to register a new account).

---

## Running Tests

### Backend (Jest)

```bash
cd server && npm test
```

Covers:
- Decision Engine — all 4 mandatory scenarios
- Integrity Service — hash computation + evidence generation
- Authenticity Service — version comparison + cryptographic signature validation

### Frontend (React Testing Library)

```bash
cd client && npm test
```

Covers:
- `VerifyUpdate` form — rendering, validation, API call, error handling
- `VerificationResult` — all 4 verdicts, evidence table, recommendation, action buttons

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | None | Register a new user |
| POST | `/api/auth/login` | None | Login → returns JWT |
| GET | `/api/auth/me` | JWT | Get current user profile |
| POST | `/api/verify` | Optional JWT | Submit update for verification |
| GET | `/api/history` | JWT | Paginated verification history |
| GET | `/api/history/export` | JWT | Export audit log (CSV or JSON) |
| GET | `/api/trusted-software` | None | List trusted software registry |
| POST | `/api/trusted-software` | Admin JWT | Add software to registry |
| PUT | `/api/trusted-software/:id` | Admin JWT | Update registry entry |
| DELETE | `/api/trusted-software/:id` | Admin JWT | Delete registry entry |
| GET | `/api/publishers` | JWT | List trusted publishers |
| POST | `/api/publishers` | Admin JWT | Add publisher |
| PUT | `/api/publishers/:id` | Admin JWT | Update publisher |
| DELETE | `/api/publishers/:id` | Admin JWT | Delete publisher |
| GET | `/api/stats` | None | Dashboard KPI aggregation |
| GET | `/api/health` | None | DB health check |

### POST /api/verify — multipart/form-data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Software update file (max 500 MB) |
| `softwareName` | string | Yes | Software display name |
| `claimedVersion` | string | Yes | Version being submitted |
| `publisher` | string | Yes | Publisher name |
| `referenceHash` | string | No | 64-char SHA-256 hex (user-supplied) |
| `signature` | File | No | Detached signature file |
| `publicKeyPem` | string | No | PEM public key for signature verification |

### Response shape (Decision Engine)

```json
{
  "result": "VERIFIED | SUSPICIOUS | UNTRUSTED | UNKNOWN",
  "evidence": [
    { "check": "...", "component": "...", "result": "...", "detail": "..." }
  ],
  "recommendation": "Plain-language explanation.",
  "timestamp": "2024-07-01T12:00:00.000Z"
}
```

---

## Security Notes

- Passwords hashed with bcrypt (12 rounds) — never stored or logged in plaintext.
- JWTs are short-lived (default: 8 hours); all trust-management and history endpoints require a valid token.
- All inputs validated with `express-validator` before reaching service/model layers.
- Sequelize parameterised and prepared queries only — no raw SQL string concatenation.
- `helmet` enabled for HTTP header hardening.
- Rate limiting on auth (20 req/15 min) and verify (50 req/15 min) endpoints.
- `UNKNOWN` is structurally distinct from `UNTRUSTED` at every layer (enum, engine rules, UI).
- `VerificationRecord` is **write-once** (hooks block updates).

### HTTPS in Production

Local development uses HTTP. In production:
- Terminate TLS at a reverse proxy (nginx, Caddy, or a cloud load balancer).
- Set `NODE_ENV=production` and configure your production database credentials in `.env`.
- Use a strong, randomly generated `JWT_SECRET` (≥ 64 chars).

---

## Postman Collection

Import `docs/TrustUpdate.postman_collection.json` into Postman.
Set the `BASE_URL` variable to `http://localhost:5000` and `ADMIN_PASSWORD` to your administrator password. Running `Login (admin)` will automatically populate the `TOKEN` variable for subsequent protected requests.

---

## Verdict Decision Rules

| Priority | Verdict | Condition |
|----------|---------|-----------|
| 1 | **UNTRUSTED** | Any hard-fail token (MISMATCH, INVALID, ROLLBACK_DETECTED, UNTRUSTED_PUBLISHER) |
| 2 | **UNKNOWN** | All results are NO_REFERENCE / MISSING — nothing could be checked |
| 3 | **SUSPICIOUS** | Some results are NO_REFERENCE / MISSING; or UNKNOWN_PUBLISHER; or NEWER_THAN_APPROVED |
| 4 | **VERIFIED** | All results are pass tokens |
| 5 | **SUSPICIOUS** | Fallback for any unclassified state |
