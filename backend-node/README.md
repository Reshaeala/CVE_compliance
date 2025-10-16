# Node backend (Fastify + sql.js, no native modules)

This backend avoids native addons (no `node-gyp`, no `better-sqlite3`) so it installs cleanly on Node v24 / ARM Macs.

## Quick start
```bash
cd backend-node
cp .env.example .env   # optional: set OpenCVE creds
npm install
npm run dev            # http://localhost:8000
```

All endpoints live under `/api/...` and match the React frontend:
- `GET  /api/healthz`
- `POST /api/inventory/upload` (CSV: vendor, product, version, asset_type, environment?, notes?)
- `GET  /api/inventory`
- `POST /api/runs?vendor=cisco`  body: `{ "all_pages": true, "operator": "ui" }`
- `GET  /api/runs`
- `GET  /api/findings`
- `PATCH /api/findings/:id`
- `GET  /api/reports/r2.csv`
- `GET  /api/reports/narrative.pdf`

**Persistence**: uses `sql.js` (WASM SQLite). The `.db` file is saved to `DB_PATH` after writes.
