# TrustUpdate — System Architecture

**IE3092 — Information Security Project, SLIIT**

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Client (React SPA)                  │
│  Dashboard | Verify Update | History | Trusted SW    │
│       Login  ←→  AuthContext  ←→  PrivateRoute       │
│                  Axios + JWT Interceptor              │
└───────────────────┬─────────────────────────────────┘
                    │ HTTPS / REST JSON
                    ▼
┌─────────────────────────────────────────────────────┐
│              REST API  (Express.js)                  │
│  helmet ▸ CORS ▸ rateLimit ▸ validators ▸ JWT        │
│                                                      │
│  POST /api/verify                                    │
│  ┌──────────────────────────────────────────────┐   │
│  │    verificationController.js                 │   │
│  │    Promise.allSettled([C2, C3, C4])          │   │
│  │                                              │   │
│  │  ┌──────────────┐  ┌──────────────────────┐ │   │
│  │  │  Component 2 │  │     Component 3       │ │   │
│  │  │ integrityService│ │authenticityService   │ │   │
│  │  │ SHA-256 hash │  │ sig verify            │ │   │
│  │  │ + compare    │  │ publisher identity    │ │   │
│  │  └──────────────┘  │ version/rollback      │ │   │
│  │                    └──────────────────────┘ │   │
│  │  ┌──────────────────────────────────────┐   │   │
│  │  │           Component 4                │   │   │
│  │  │      trustHistoryService.js          │   │   │
│  │  │  prior record lookup + audit write   │   │   │
│  │  └──────────────────────────────────────┘   │   │
│  │                                              │   │
│  │  ┌──────────────────────────────────────┐   │   │
│  │  │        Decision Engine               │   │   │
│  │  │    decisionEngine.js                 │   │   │
│  │  │  Rule-based verdict aggregation:     │   │   │
│  │  │  VERIFIED | SUSPICIOUS |             │   │   │
│  │  │  UNTRUSTED | UNKNOWN                 │   │   │
│  │  └──────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  GET  /api/history         (audit log query)         │
│  GET  /api/stats           (dashboard aggregation)   │
│  CRUD /api/trusted-software (admin only)             │
│  CRUD /api/publishers       (admin only)             │
└───────────────────┬─────────────────────────────────┘
                    │ Sequelize ORM (MySQL / SQLite)
                    ▼
┌─────────────────────────────────────────────────────┐
│              Relational Database (MySQL / SQLite)   │
│                                                      │
│  ┌───────────────┐  ┌───────────────────────────┐  │
│  │     Users     │  │   TrustedSoftwares         │  │
│  │ username      │  │ softwareName               │  │
│  │ passwordHash  │  │ publisher                  │  │
│  │ role          │  │ latestApprovedVersion       │  │
│  └───────────────┘  │ referenceHash              │  │
│                     │ trustStatus                │  │
│  ┌───────────────┐  └───────────────────────────┘  │
│  │  Publishers   │  ┌───────────────────────────┐  │
│  │ name          │  │  VerificationRecords       │  │
│  │ verifiedIdent │  │  (write-once audit log)    │  │
│  │ publicKeyRef  │  │ softwareName, result       │  │
│  │ trusted       │  │ evidence[], recommendation │  │
│  └───────────────┘  │ timestamp (indexed)        │  │
│                     └───────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### Component 1 — Software Verification Interface (Frontend)

The React SPA serves as the user interface for all interactions.

**Key design decisions:**
- `AuthContext` holds the JWT and user profile; `PrivateRoute` gates all pages.
- The Axios instance auto-attaches the JWT to every request via an interceptor.
- `VerifyUpdate` sends a `multipart/form-data` POST — file + text fields in one request.
- `VerificationResult` reads the decision from React Router `location.state` — no extra API call needed.

### Component 2 — Integrity Verification (`integrityService.js`)

- SHA-256 hash is computed by **streaming** the file through a `crypto.createHash` transform, keeping memory usage constant regardless of file size.
- Compares the computed hash against the `referenceHash` in the `TrustedSoftware` collection, or against a user-supplied hash.
- Returns exactly one of: `MATCH | MISMATCH | NO_REFERENCE` — never a verdict.

### Component 3 — Authenticity & Trust (`authenticityService.js`)

Three independent sub-checks:

| Sub-check | Method | Evidence token |
|-----------|--------|----------------|
| Signature | `crypto.createVerify('SHA256')` | VALID / INVALID / MISSING |
| Publisher | Database lookup in `Publishers` table | MATCH / UNKNOWN_PUBLISHER / UNTRUSTED_PUBLISHER |
| Version freshness | Integer comparison of version segments | OK / ROLLBACK_DETECTED / NEWER_THAN_APPROVED |

All three run in parallel (`Promise.all`). A missing input yields a `MISSING` result without blocking the others.

### Component 4 — Trust Management History (`trustHistoryService.js`)

- Queries `VerificationRecords` for a prior `VERIFIED` record for the exact software+publisher+version combination.
- Provides CRUD helpers for the `TrustedSoftware` registry (consumed by the admin API).
- Writes the final audit record (`VerificationRecord.create()`).
- Provides dashboard aggregation on verification history.

### Explainable Decision Engine (`decisionEngine.js`)

Pure function — no database calls, no side effects.

**Rule priority (first match wins):**

```
1. Any hard-fail token present  →  UNTRUSTED
   (MISMATCH, INVALID, ROLLBACK_DETECTED, UNTRUSTED_PUBLISHER)

2. All results are no-reference/missing  →  UNKNOWN
   (software completely unknown — NOT a security failure)

3. Some results are no-reference/missing  →  SUSPICIOUS
   OR UNKNOWN_PUBLISHER OR NEWER_THAN_APPROVED

4. All present results are pass tokens  →  VERIFIED

5. Fallback  →  SUSPICIOUS
```

---

## Data Flow — Single Verification Run

```
Browser                Express                  Database (MySQL / SQLite)
   │                     │                        │
   │── POST /api/verify ─►│                        │
   │   (multipart file)   │── find TrustedSoftware ►│
   │                      │◄─ record ──────────────│
   │                      │── find Publisher ───────►│
   │                      │◄─ record ──────────────│
   │                      │── find VerifRecord ─────►│
   │                      │◄─ prior record ─────────│
   │                      │                        │
   │           [compute SHA-256 from disk stream]   │
   │           [verify signature if provided]       │
   │           [compare versions]                   │
   │           [run Decision Engine rules]          │
   │                      │                        │
   │                      │── insert VerifRecord ───►│
   │                      │   (write-once audit)   │
   │◄── JSON decision ────│                        │
   │   { result, evidence,│                        │
   │     recommendation,  │                        │
   │     timestamp }      │                        │
```

---

## Security Architecture

```
HTTPS (TLS termination at reverse proxy in production)
  │
  ▼
helmet (CSP, HSTS, X-Frame-Options, etc.)
  │
  ▼
express-rate-limit (20 req/15min auth, 50 req/15min verify)
  │
  ▼
express-validator (sanitise + validate every field)
  │
  ▼
JWT middleware (auth.js) — verifies signature, checks expiry
  │
  ▼
requireRole('admin') — enforces role on mutation endpoints
  │
  ▼
Sequelize parameterised / prepared queries (no raw SQL concatenation)
  │
  ▼
Relational Database (MySQL / SQLite with parameterized queries)
```

---

## Verdict Taxonomy

```
                 Reference data available?
                 ┌──────────────────────┐
                 │          Yes         │  No (all missing)
                 │                      │
         Checks pass?         ┌─────────┴──────────┐
         ┌─────┴─────┐        │     UNKNOWN         │
        Yes          No       │  (not a failure)    │
         │            │       └────────────────────┘
    ┌────┴────┐   ┌───┴───┐
    │VERIFIED │   │Hard   │  Partial
    │         │   │fail?  │  mismatch?
    └─────────┘   │ Yes No│
                  │  │  └─► SUSPICIOUS
                  │  └────► UNTRUSTED
                  └─────────────────
```

UNKNOWN and UNTRUSTED are enforced as structurally separate string literals throughout the codebase — they cannot be confused.
