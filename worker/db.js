const TABLES = new Set([
  "messages",
  "invoices",
  "invoice_items",
  "clients",
  "projects",
  "settings",
  "notes",
  "whiteboards",
  "note_versions",
  "email_tracking",
  "email_tracking_logs",
  "proposals",
  "profiles",
  "permissions",
  "team_invites",
  "leads",
  "tasks",
  "expenses",
  "project_files",
  "skills",
  "blogs",
  "portfolio",
]);

function assertTable(table) {
  if (!TABLES.has(table)) throw new Error("Unknown table");
}

function asBool(value) {
  if (value === true || value === false) return value;
  if (value === 1 || value === 0) return Boolean(value);
  return null;
}

function same(a, b) {
  if (a === b) return true;
  if (a == null && b == null) return true;
  const left = asBool(a);
  const right = asBool(b);
  if (left !== null && right !== null) return left === right;
  return String(a) === String(b);
}

function matches(row, filters) {
  return filters.every((filter) => {
    if (filter.op !== "eq") throw new Error("Unsupported filter");
    return same(row[filter.col], filter.val);
  });
}

function project(row, columns) {
  if (!columns || columns === "*") return row;
  const out = {};
  for (const key of columns.split(",").map((part) => part.trim()).filter(Boolean)) {
    out[key] = row[key] === undefined ? null : row[key];
  }
  return out;
}

function sortRows(rows, orders) {
  if (!orders?.length) return rows;
  return [...rows].sort((a, b) => {
    for (const order of orders) {
      const av = a[order.column];
      const bv = b[order.column];
      if (av == null && bv == null) continue;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av === bv) continue;
      const cmp = av > bv ? 1 : -1;
      return order.ascending === false ? -cmp : cmp;
    }
    return 0;
  });
}

const BLOB_LIMIT = 60000;

export async function parseStoredBody(env, text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed.__blob !== "string" || !parsed.__blob.startsWith("rows/")) return parsed;
  const object = await env.MEDIA.get(parsed.__blob);
  if (!object) throw new Error("Stored row file is missing");
  return JSON.parse(await object.text());
}

export async function saveStoredRow(env, table, row) {
  assertTable(table);
  const json = JSON.stringify(row);
  let stored = json;
  if (json.length > BLOB_LIMIT) {
    const key = `rows/${table}/${row.id}.json`;
    await env.MEDIA.put(key, json, { httpMetadata: { contentType: "application/json" } });
    stored = JSON.stringify({ __blob: key, id: row.id });
  }
  await env.DB.prepare(
    "INSERT INTO app_rows (tbl, id, body) VALUES (?, ?, ?) ON CONFLICT(tbl, id) DO UPDATE SET body = excluded.body"
  ).bind(table, row.id, stored).run();
}

export async function loadTable(env, table) {
  assertTable(table);
  const { results } = await env.DB.prepare("SELECT id, body FROM app_rows WHERE tbl = ?").bind(table).all();
  const rows = [];
  for (const row of results) rows.push(await parseStoredBody(env, row.body));
  return rows;
}

async function saveRow(env, table, row) {
  await saveStoredRow(env, table, row);
}

export async function runQuery(env, request) {
  assertTable(request.table);
  const filters = Array.isArray(request.filters) ? request.filters : [];
  const orders = Array.isArray(request.orders) ? request.orders : [];
  let rows = await loadTable(env, request.table);
  rows = rows.filter((row) => matches(row, filters));
  rows = sortRows(rows, orders);
  if (request.limit) rows = rows.slice(0, Number(request.limit));

  if (request.op === "select") {
    return finishRead(rows, request);
  }

  if (request.op === "insert") {
    const incoming = Array.isArray(request.values) ? request.values : [request.values];
    const inserted = [];
    for (const raw of incoming) {
      const row = normalize(raw);
      if (!row.id) row.id = crypto.randomUUID();
      if (!row.created_at) row.created_at = new Date().toISOString();
      await saveRow(env, request.table, row);
      inserted.push(row);
    }
    if (!request.returning) return { data: null, error: null };
    return finishRead(inserted, request);
  }

  if (request.op === "update") {
    const patch = normalize(request.values || {});
    delete patch.id;
    const updated = [];
    for (const row of rows) {
      const next = { ...row, ...patch };
      await saveRow(env, request.table, next);
      updated.push(next);
    }
    if (!request.returning) return { data: null, error: null };
    return finishRead(updated, request);
  }

  if (request.op === "delete") {
    for (const row of rows) {
      await env.DB.prepare("DELETE FROM app_rows WHERE tbl = ? AND id = ?").bind(request.table, row.id).run();
    }
    return { data: null, error: null };
  }

  if (request.op === "upsert") {
    const keys = String(request.onConflict || "id").split(",").map((key) => key.trim()).filter(Boolean);
    const incoming = Array.isArray(request.values) ? request.values : [request.values];
    const all = await loadTable(env, request.table);
    const written = [];
    for (const raw of incoming) {
      const row = normalize(raw);
      const existing = all.find((item) => keys.every((key) => same(item[key], row[key])));
      if (existing) {
        const next = { ...existing, ...row, id: existing.id };
        await saveRow(env, request.table, next);
        written.push(next);
      } else {
        if (!row.id) row.id = crypto.randomUUID();
        if (!row.created_at) row.created_at = new Date().toISOString();
        await saveRow(env, request.table, row);
        all.push(row);
        written.push(row);
      }
    }
    if (!request.returning) return { data: null, error: null };
    return finishRead(written, request);
  }

  throw new Error("Unsupported operation");
}

function finishRead(rows, request) {
  const projected = rows.map((row) => project(row, request.columns));
  if (request.mode === "single") {
    if (projected.length !== 1) {
      return { data: null, error: { message: "JSON object requested, multiple (or no) rows returned" } };
    }
    return { data: projected[0], error: null };
  }
  if (request.mode === "maybeSingle") {
    if (projected.length > 1) {
      return { data: null, error: { message: "JSON object requested, multiple rows returned" } };
    }
    return { data: projected[0] || null, error: null };
  }
  return { data: projected, error: null };
}

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const [key, item] of Object.entries(value)) {
    out[key] = item instanceof Date ? item.toISOString() : item;
  }
  return out;
}

export function isPublicQuery(request) {
  if (request.op === "insert" && request.table === "messages") return true;
  if (
    request.op === "select" &&
    request.table === "team_invites" &&
    (request.mode === "single" || request.mode === "maybeSingle") &&
    request.filters?.length === 1 &&
    request.filters[0].op === "eq" &&
    request.filters[0].col === "token"
  ) {
    return true;
  }
  return false;
}

export function sanitizePublicInsert(request) {
  const incoming = Array.isArray(request.values) ? request.values : [request.values];
  return incoming.map((row) => ({
    name: String(row?.name || "").slice(0, 200),
    email: String(row?.email || "").slice(0, 200),
    subject: String(row?.subject || "").slice(0, 300),
    message: String(row?.message || "").slice(0, 5000),
    status: "new",
    is_read: false,
  }));
}
