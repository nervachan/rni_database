# RNI Database — Technical Documentation

## 1. Executive Summary

The RNI Database is a combined library for tracking and managing research entries, IPs, and startups across RSO and INTTO. It is a full-stack, role-based web application built to give each department (RSO and INTTO) dedicated management tools over their own records, while giving a superadmin oversight of user accounts, system logs, and account approvals.

This document covers the system's tech stack, environment configuration, CRUD access model, database schema, local development setup, and recommendations for future development.

---

## 2. Tech Stack

### 2.1 Frontend
- **Vue 3** (Composition API)
- **Vite** — build tool and dev server
- **Pinia** — state management (auth store, role/session state)
- **Firebase Authentication (client SDK)** — user login/session handling

### 2.2 Backend
- **Express.js** — REST API server
- **Firebase Admin SDK** — token verification, custom claims (role assignment)
- **Supabase (PostgreSQL)** — primary data store for all application records
- Backend runs as an isolated CommonJS module (`.cjs` files, `api/` directory with its own `package.json` set to `"type": "commonjs"`) to avoid ESM conflicts with the root project.

---

## 3. Environment Setup (`.env`)

The following environment variables are required. Values are not listed here for security; obtain them from the project supervisor or existing team member.

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase service/anon key |
| `FRONTEND_URL` | Frontend origin, used for CORS |
| `PORT` | Port the Express server runs on |
| `BACKEND_URL` | Backend origin, used by frontend for API calls |

> Note: `.env` is gitignored and must be created manually in the project root before running the backend.

---

## 4. CRUD Functions

*Pending clarification with supervisor on required scope/detail for this section. To be added once confirmed.*

### 4.1 Role-Based CRUD Restrictions

| Resource | RSO | INTTO | superadmin |
|---|---|---|---|
| research-entries | Full CRUD | Read-only | — |
| startups | Read-only | Full CRUD | — |
| ips | Read-only | Full CRUD | — |
| cohorts | Read-only | Full CRUD | — |
| classifications | Read-only | Full CRUD | — |
| users / logs / notifications / applications | — | — | Full CRUD / manage |

Superadmin has no access to RSO or INTTO data — these are entirely separate domains. Access is enforced via `verifyToken` and `requireRole` middleware on each route.

---

## 5. Database Schema

All tables are hosted on Supabase (PostgreSQL).

### 5.1 `applications`
Holds pending user registration requests before approval. Tracks the applicant's Firebase UID, name, email, requested role, and approval status (`pending`, `processing`, `approved`, `rejected`). This table is the intake point for the approval pipeline — once approved, a corresponding row is created in `users` and a Firebase custom claim is set.

### 5.2 `users`
The authoritative record of approved system users. Links to Firebase Auth via `firebase_uid`, stores the user's role (`RSO`, `INTTO`, `super-admin`), name, email, and account status (`Active`/`Inactive`). This table (combined with the Firebase custom claim) determines what a logged-in user can access.

### 5.3 `research_entries`
RSO-owned records for research work: title, authors, co-authors, ISBN, Scopus link, start/end dates, and abstract. INTTO has read-only access to this table.

### 5.4 `startups`
INTTO-owned records for tracked startups: name, genre, short description, logo URL, and an associated `cohort_id`. RSO has read-only access.

### 5.5 `ips`
INTTO-owned records for intellectual property filings: title, inventors (array), filing date, status, reference number, and a linked `classification_id`. RSO has read-only access.

### 5.6 `cohorts`
INTTO-owned lookup table grouping startups by batch/cohort (name, creation date). Referenced by `startups.cohort_id`.

### 5.7 `classifications`
INTTO-owned lookup table for IP classification types. Referenced by `ips.classification_id`. RSO has read access where needed for INTTO-facing read-only views.

### 5.8 `logs`
System-wide activity log. Records the action taken, actor's name/email/role, and severity. Superadmin-only access.

### 5.9 `notifications`
Simple system notification records (text + timestamp). Superadmin-only access.

### 5.10 Firebase Auth (user identity)
User identity and session handling is managed by Firebase Authentication, separate from the Supabase tables above. Key details:
- Accounts are created with `disabled: true` on registration and only enabled once approved.
- On approval, a custom claim (role) is set on the Firebase user via the Admin SDK — this is what backend middleware checks on each request, alongside the `users` table row.

---

## 6. Development Setup

### 6.1 Prerequisites (gitignored files — not in repo)
These files are required for the system to run but are excluded from version control for security. Obtain them privately from the project supervisor/team:

- **`.env`** (root and/or `api/`, per Section 3) — environment variables
- **Firebase service account file** — required by the Firebase Admin SDK for token verification and custom claims. Place at the path expected by the backend config before starting the server. Without this file, the backend cannot verify auth tokens and will fail on startup or on every authenticated request.

### 6.2 Running the project locally
Two processes must run simultaneously (in separate terminals):

```bash
# Terminal 1 — Express backend (port 3000)
npm run server

# Terminal 2 — Vite frontend (port 5173)
npm run dev
```

Vite proxies `/api/*` requests to the Express server. Both must be running for the app to function in development.

### 6.3 Creating the first superadmin (`createSuperAdmin.cjs`)
Since no superadmin exists on a fresh setup, this script bootstraps the first one (and serves as a break-glass recovery tool if superadmin access is ever lost).

*(Usage steps to be filled in — confirm exact command/arguments before finalizing this section.)*

---

## 7. Further Additions / Recommendations

Recommendations for future development, based on gaps identified during this internship's RBAC implementation:

### 7.1 New Roles
- **Viewer role** — read-only access to both RSO and INTTO libraries, combined into a single page. Should not require login; intended as a public-facing landing page/library for browsing records only.
- **Executive role** — a unique login granting full CRUD over both RSO and INTTO libraries in a single account, effectively combining RSO and INTTO permissions for one user type.

### 7.2 Import / Export
- **Import**: RSO can only import RSO-related records; INTTO can only import INTTO-related records (mirrors existing CRUD boundaries).
- **Export**: Executive role can export reports covering both RSO and INTTO data in a single action.
- Export scope/format for regular RSO and INTTO roles needs further clarification from stakeholders before implementation.

### 7.3 System Backup
- **Backup**: Data from the system should be backed up somewhere else and should be accessible in case of emergencies
- **Backup Intervals**: Data should be backed up daily (recommended) or weekly. 

---

*Document status: Sections 4.1 (CRUD table) and 5 (Schema) are complete. Section 4 (CRUD backend function walkthrough) and 6.3 (createSuperAdmin usage) are pending further input.*