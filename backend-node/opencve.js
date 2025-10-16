// backend-node/opencve.js
import { fetch } from "undici";
import crypto from "crypto";

export class OpenCVEError extends Error {}

function authHeader(user, pass) {
  if (!user || !pass) return {};
  const b64 = Buffer.from(`${user}:${pass}`).toString("base64");
  return { Authorization: `Basic ${b64}` };
}

export async function fetchWithCache(
  dbctx,
  url,
  params,
  ttlSeconds = 21600,
  user,
  pass
) {
  const { db, persist } = dbctx;
  const key = crypto
    .createHash("sha256")
    .update(JSON.stringify({ url, params }))
    .digest("hex");

  // read cache
  const rows = db.exec(
    `SELECT payload, fetched_at FROM http_cache WHERE cache_key = '${key}'`
  );
  if (rows.length) {
    const [cols, vals] = [rows[0].columns, rows[0].values[0]];
    const payload = vals[cols.indexOf("payload")];
    const fetched = vals[cols.indexOf("fetched_at")];
    const age = (Date.now() - new Date(fetched).getTime()) / 1000;
    if (age < ttlSeconds) return JSON.parse(payload);
  }

  const qs = new URLSearchParams(params || {}).toString();
  const u = qs ? `${url}?${qs}` : url;
  const headers = { accept: "application/json", ...authHeader(user, pass) };
  const resp = await fetch(u, { headers });
  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    throw new OpenCVEError(
      `${resp.status} from OpenCVE ${url}: ${JSON.stringify(data).slice(
        0,
        300
      )}`
    );
  }

  // upsert cache
  const insert = db.prepare(
    "INSERT OR REPLACE INTO http_cache (cache_key, fetched_at, payload) VALUES (?, datetime('now'), ?)"
  );
  try {
    insert.run([key, JSON.stringify(data)]);
  } finally {
    insert.free && insert.free();
  }
  persist();
  return data;
}

export async function vendorCVEs(
  dbctx,
  baseUrl,
  vendor,
  params,
  allPages = true,
  user,
  pass
) {
  let itemsAll = [];
  let page = 1;
  while (true) {
    const url = `${baseUrl}/vendors/${vendor}/cve`;
    const data = await fetchWithCache(
      dbctx,
      url,
      { ...params, page },
      21600,
      user,
      pass
    );
    const items = data.items || data.vulnerabilities || [];
    itemsAll = itemsAll.concat(items);
    const total = Number(data.total || items.length);
    if (!allPages || itemsAll.length >= total || items.length === 0) break;
    page += 1;
  }
  return itemsAll;
}
