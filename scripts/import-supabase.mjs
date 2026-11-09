/**
 * Copy Supabase rows into D1.
 *
 * The anon key cannot read the CRM tables (row level security returns empty).
 * Put the service role key in .env as SUPABASE_SERVICE_ROLE_KEY, then run:
 *   node scripts/import-supabase.mjs
 *   npx wrangler d1 execute harsh-portfolio --remote --file=.wrangler/supabase-import.sql
 */
import fs from "fs";

const env = Object.fromEntries(
  fs.readFileSync(".env", "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    })
);

const url = env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Add SUPABASE_SERVICE_ROLE_KEY to .env, then run this script again.");
  process.exit(1);
}

const tables = [
  "messages", "invoices", "invoice_items", "clients", "projects", "settings",
  "notes", "whiteboards", "note_versions", "email_tracking", "email_tracking_logs",
  "proposals", "profiles", "permissions", "team_invites", "leads", "tasks",
  "expenses", "project_files", "skills", "blogs",
];

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const statements = ["DELETE FROM app_rows;"];
for (const table of tables) {
  let offset = 0;
  for (;;) {
    const response = await fetch(`${url}/rest/v1/${table}?select=*&limit=200&offset=${offset}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!response.ok) {
      console.error(`${table} ${response.status}`);
      break;
    }
    const rows = await response.json();
    for (const row of rows) {
      const id = row.id || crypto.randomUUID();
      statements.push(
        `INSERT INTO app_rows (tbl, id, body) VALUES (${sqlString(table)}, ${sqlString(id)}, ${sqlString(JSON.stringify({ ...row, id }))});`
      );
    }
    console.error(`${table} +${rows.length}`);
    if (rows.length < 200) break;
    offset += 200;
  }
}

fs.mkdirSync(".wrangler", { recursive: true });
const out = ".wrangler/supabase-import.sql";
fs.writeFileSync(out, statements.join("\n"));
console.error(`Wrote ${statements.length - 1} rows to ${out}`);
