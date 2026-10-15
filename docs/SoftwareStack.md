# TrustUpdate — Software Stack Specification

**IE3092 — Information Security Project, SLIIT**

---

## Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework (function components + Hooks) |
| React Router DOM | 6.x | Client-side routing (SPA navigation) |
| Axios | 1.x | HTTP client with JWT interceptor |
| Recharts | 2.x | Dashboard charts (stacked bar chart) |
| React Testing Library | 16.x | Component tests |
| @testing-library/user-event | 14.x | Simulated user interactions in tests |

**Pages:**
- `Dashboard` — KPI cards + Recharts activity chart + recent feed
- `VerifyUpdate` — drag-and-drop file upload + 4-step explainer
- `VerificationResult` — verdict badge + evidence table + action buttons
- `VerificationHistory` — filterable/paginated table + CSV/JSON export
- `TrustedSoftware` — registry table with admin CRUD modal
- `Login` — JWT-based auth

---

## Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | LTS (≥18) | Runtime |
| Express.js | 4.x | HTTP framework |
| Sequelize | 6.x | ORM for MySQL and SQLite |
| mysql2 | 3.x | MySQL client library |
| sqlite3 | 5.x / 6.x | SQLite driver for local zero-config execution |
| jsonwebtoken | 9.x | JWT issuance and verification |
| bcryptjs | 2.x | Password hashing (12 rounds) |
| Multer | 1.x | Multipart file upload (max 500 MB) |
| helmet | 7.x | HTTP header security |
| express-rate-limit | 7.x | Per-IP rate limiting |
| express-validator | 7.x | Input validation and sanitisation |
| cors | 2.x | Cross-Origin Resource Sharing |
| dotenv | 16.x | Environment variable loading |

**Architecture layers:**
```
routes → controllers → services → models
```

**Services:**
- `integrityService.js` — SHA-256 streaming hash + reference comparison (Component 2)
- `authenticityService.js` — signature verify, publisher match, rollback check (Component 3)
- `trustHistoryService.js` — registry lookups, audit log write, export (Component 4)
- `decisionEngine.js` — rule-based verdict aggregation

---

## Database

| Technology | Purpose |
|------------|---------|
| MySQL / MariaDB | Production Relational database |
| SQLite | Embedded, file-backed database for local zero-config development/testing |
| Sequelize | ORM with schema validation, model hooks, and parameterized queries |

**Models / Tables:**
- `Users` — bcrypt-hashed credentials (12 salt rounds) + role (admin/viewer)
- `Publishers` — trusted signing identities & public certificates
- `TrustedSoftwares` — software registry with reference hashes & approval status
- `VerificationRecords` — write-once audit log (model hooks block updates)

---

## Cryptography

| Operation | Node.js API |
|-----------|-------------|
| SHA-256 file hash | `crypto.createHash('sha256')` — streamed for memory efficiency |
| Digital signature verify | `crypto.createVerify('SHA256')` |
| Password hashing | `bcrypt.hash()` / `bcrypt.compare()` — 12 salt rounds |
| JWT sign | `jwt.sign({ id, username, role }, secret, { expiresIn })` |
| JWT verify | `jwt.verify(token, secret)` |

---

## Testing

| Layer | Framework | Coverage |
|-------|-----------|---------|
| Backend services | Jest 29.x | Decision Engine (4 scenarios), integrity hash, signature validation |
| Frontend components | React Testing Library | VerifyUpdate form, VerificationResult display |

---

## Development Tools

| Tool | Purpose |
|------|---------|
| nodemon | Auto-restart server on file changes |
| ESLint (airbnb-base) | Code style enforcement |
| Prettier | Code formatting |
| Supertest | HTTP integration tests (Node) |

---

## Security Middleware Stack

```
Request → helmet (headers) → CORS → rateLimit → body-parser → express-validator → controller
```
