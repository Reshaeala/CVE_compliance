import fs from 'fs'
import initSqlJs from 'sql.js'

export async function openDb(dbPath = './opencve.db'){
  const SQL = await initSqlJs({ locateFile: (file) => `node_modules/sql.js/dist/${file}` })
  let db
  if (fs.existsSync(dbPath)){
    const fileBuffer = fs.readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
  }
  // schema
  db.run(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL DEFAULT 'default',
      vendor TEXT NOT NULL,
      product TEXT NOT NULL,
      version TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      environment TEXT DEFAULT 'prod',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL DEFAULT 'default',
      vendor TEXT NOT NULL,
      params_json TEXT NOT NULL,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      total_items INTEGER DEFAULT 0,
      new_items INTEGER DEFAULT 0,
      operator TEXT,
      notes TEXT
    );
    CREATE TABLE IF NOT EXISTS findings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id INTEGER NOT NULL,
      tenant_id TEXT NOT NULL DEFAULT 'default',
      inventory_item_id INTEGER NOT NULL,
      cve_id TEXT NOT NULL,
      title TEXT,
      summary TEXT,
      cvss REAL,
      published_at TEXT,
      match_score REAL,
      status TEXT DEFAULT 'unreviewed',
      device_owner TEXT,
      mitigation_notes TEXT,
      target_date TEXT,
      first_seen_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      raw_json TEXT NOT NULL,
      UNIQUE(tenant_id, inventory_item_id, cve_id)
    );
    CREATE TABLE IF NOT EXISTS http_cache (
      cache_key TEXT PRIMARY KEY,
      fetched_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );
  `)
  const persist = () => {
    const data = db.export()
    fs.writeFileSync(dbPath, Buffer.from(data))
  }
  return { db, persist }
}

export function all(db, sql, params = []){
  const stmt = db.prepare(sql)
  try {
    stmt.bind(params)
    const rows = []
    while (stmt.step()){
      rows.push(stmt.getAsObject())
    }
    return rows
  } finally {
    stmt.free()
  }
}

export function run(db, sql, params = []){
  const stmt = db.prepare(sql)
  try { stmt.run(params) } finally { stmt.free() }
}

export function get(db, sql, params = []){
  const stmt = db.prepare(sql)
  try {
    stmt.bind(params)
    if (stmt.step()) return stmt.getAsObject()
    return null
  } finally { stmt.free() }
}

export function lastInsertRowId(db){
  // sql.js doesn't expose last_insert_rowid() directly, use a query
  const row = all(db, 'SELECT last_insert_rowid() AS id')[0]
  return row?.id ?? null
}
