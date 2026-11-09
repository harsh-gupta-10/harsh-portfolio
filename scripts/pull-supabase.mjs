import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ref = "pcfhsttwecqzfcewglrm";
const tables = [
  "clients",
  "email_tracking",
  "email_tracking_logs",
  "invoice_items",
  "invoices",
  "note_versions",
  "notes",
  "permissions",
  "profiles",
  "proposals",
  "settings",
  "team_invites",
  "whiteboards",
];

function query(sql) {
  const out = execFileSync(
    "npx",
    ["supabase", "db", "query", "--remote", ref, "--read-only", "--output-format", "json", sql],
    { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }
  );
  return JSON.parse(out.slice(out.indexOf("{")));
}

function rewrite(value) {
  if (typeof value === "string") {
    return value.replace(
      /https:\/\/pcfhsttwecqzfcewglrm\.supabase\.co\/storage\/v1\/object\/(?:public|sign)\/([^/"'\s]+)\/([^"'\s?]+)/g,
      (_, bucket, key) => `/api/media?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(key)}`
    );
  }
  if (Array.isArray(value)) return value.map(rewrite);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, item] of Object.entries(value)) out[key] = rewrite(item);
    return out;
  }
  return value;
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const statements = ["DELETE FROM app_rows;"];
const blobs = [];

for (const table of tables) {
  const result = query(`select coalesce(json_agg(to_jsonb(t)), '[]'::json) as data from public.${table} t`);
  let data = result.rows[0].data;
  if (typeof data === "string") data = JSON.parse(data);
  if (!Array.isArray(data)) throw new Error(`${table} did not return a list`);
  console.error(`${table} ${data.length}`);
  for (const raw of data) {
    const row = rewrite(raw);
    if (!row.id) row.id = crypto.randomUUID();
    const json = JSON.stringify(row);
    if (json.length > 60000) {
      const key = `rows/${table}/${row.id}.json`;
      const file = path.join(".wrangler", "blobs", key);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, json);
      blobs.push({ key, file });
      const stub = JSON.stringify({ __blob: key, id: row.id });
      statements.push(
        `INSERT INTO app_rows (tbl, id, body) VALUES (${sqlString(table)}, ${sqlString(row.id)}, ${sqlString(stub)});`
      );
    } else {
      statements.push(
        `INSERT INTO app_rows (tbl, id, body) VALUES (${sqlString(table)}, ${sqlString(row.id)}, ${sqlString(json)});`
      );
    }
  }
}

fs.mkdirSync(".wrangler", { recursive: true });
fs.writeFileSync(".wrangler/supabase-import.sql", `${statements.join("\n")}\n`);
console.error(`rows ${statements.length - 1} blobs ${blobs.length}`);
