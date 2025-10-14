# openCVE-compliance (MVP)

React (Vite+TS) frontend + FastAPI backend + SQLite. SSO is stubbed for later (OIDC placeholders).

## Quick Start

### 1) Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Env vars (create `.env` or export; see `.env.example`):
```
DB_URL=sqlite:///./opencve.db
OPENCVE_BASE_URL=https://app.opencve.io/api
OPENCVE_USERNAME=your_username
OPENCVE_PASSWORD=your_password
# OIDC later:
OIDC_ISSUER=
OIDC_CLIENT_ID=
OIDC_AUDIENCE=
```

### 2) Frontend
```bash
cd frontend
npm i
npm run dev
# open http://localhost:5173
```

The dev server proxies `/api` → `http://localhost:8000`.

## Endpoints (MVP)

- `POST /api/inventory/upload` (CSV) — columns: vendor, product, version, asset_type, environment?, notes?
- `GET  /api/inventory`
- `POST /api/runs?vendor=cisco` body: `{ "all_pages": true, "operator": "ui" }`
- `GET  /api/runs` ; `GET /api/runs/{id}`
- `GET  /api/findings` ; `PATCH /api/findings/{id}`
- `GET  /api/reports/r2.csv?start=YYYY-MM-DD&end=YYYY-MM-DD`
- `GET  /api/reports/narrative.pdf?start=YYYY-MM-DD&end=YYYY-MM-DD&vendor_list=cisco,digi`

## Notes

- **SSO**: middleware stub included. Wire up JWT validation (Auth0/Okta/Azure) later.
- **SQLite**: single-file DB `opencve.db` in backend working dir.
- **35-day proof**: your evaluation runs list + reports serve as evidence.
- **Device Owner**: set per finding in the UI (drawer panel).
# CVE_compliance
