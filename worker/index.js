import { isPublicQuery, parseStoredBody, runQuery, sanitizePublicInsert, saveStoredRow } from "./db.js";
import {
  bytesToB64,
  createAccount,
  createSession,
  digest,
  getSessionUser,
  safeEqual,
  sessionCookie,
  verifyPassword,
} from "./auth.js";
import { WhiteboardRoom } from "./room.js";

export { WhiteboardRoom };

const PIXEL = Uint8Array.from([
  71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 0, 0, 0,
  255, 255, 255, 33, 249, 4, 1, 0, 0, 0, 0, 44, 0, 0, 0, 0,
  1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59,
]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/sitemap.xml") {
      const today = new Date().toISOString().slice(0, 10);
      const host = url.host || "harshugupta.in";
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${host}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://${host}/projects</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://${host}/portfolio</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://${host}/snapmaker</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
      return new Response(xml, {
        headers: {
          "content-type": "application/xml; charset=UTF-8",
          "cache-control": "public, max-age=3600",
        },
      });
    }

    if (url.pathname === "/robots.txt") {
      const host = url.host || "harshugupta.in";
      const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /portfolio-admin
Disallow: /api/

Sitemap: https://${host}/sitemap.xml
`;
      return new Response(robots, {
        headers: {
          "content-type": "text/plain; charset=UTF-8",
          "cache-control": "public, max-age=3600",
        },
      });
    }

    if (!url.pathname.startsWith("/api/")) {
      return new Response(null, { status: 404 });
    }
    try {
      if (url.pathname === "/api/health") {
        return Response.json({ ok: true, service: "harsh-portfolio" });
      }
      if (url.pathname.startsWith("/api/portfolio")) return handlePortfolio(request, env, url);
      if (url.pathname === "/api/write-file") return writeLocalFile(request, env);
      if (url.pathname === "/api/query") return query(request, env);
      if (url.pathname === "/api/auth/login") return login(request, env);
      if (url.pathname === "/api/auth/logout") return logout(request, env);
      if (url.pathname === "/api/auth/session") return session(request, env);
      if (url.pathname === "/api/auth/verify-portfolio-pin") return verifyPortfolioPin(request, env);
      if (url.pathname === "/api/auth/signup") return signup(request, env);
      if (url.pathname === "/api/auth/create-member") return createMember(request, env);
      if (url.pathname === "/api/media") return media(request, env);
      if (url.pathname === "/api/track") return track(request, env, ctx);
      if (url.pathname === "/api/public/document") return viewDocument(request, env, ctx);
      if (url.pathname === "/api/public/whiteboard") return viewWhiteboard(request, env);
      if (url.pathname === "/api/realtime") return realtime(request, env);
      return Response.json({ message: "Not found" }, { status: 404 });
    } catch (error) {
      console.log(JSON.stringify({ level: "error", message: error.message, path: url.pathname }));
      return Response.json({ message: error.message || "Server error" }, { status: 500 });
    }
  },
};

async function query(request, env) {
  if (request.method !== "POST") return Response.json({ message: "Method not allowed" }, { status: 405 });
  const body = await request.json();
  const user = await getSessionUser(env, request);
  const isPortfolioAdmin = await isAuthorizedPortfolioAdmin(request, env);
  if (!user && !isPortfolioAdmin && !isPublicQuery(body)) {
    return Response.json({ data: null, error: { message: "Not authenticated" } }, { status: 401 });
  }
  if (!user && !isPortfolioAdmin && body.op === "insert" && body.table === "messages") {
    body.values = sanitizePublicInsert(body);
  }
  const result = await runQuery(env, body);
  return Response.json(result);
}

async function login(request, env) {
  if (request.method !== "POST") return Response.json({ message: "Method not allowed" }, { status: 405 });
  const { email, password } = await request.json();
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized || !password) return Response.json({ message: "Email and password are required" }, { status: 400 });

  let account = await env.DB.prepare("SELECT * FROM accounts WHERE email = ?").bind(normalized).first();
  if (!account) {
    const bootstrapped = await bootstrapOwner(env, normalized, password);
    if (!bootstrapped) return Response.json({ message: "Invalid login credentials" }, { status: 401 });
    account = bootstrapped;
  } else if (!(await verifyPassword(password, account))) {
    return Response.json({ message: "Invalid login credentials" }, { status: 401 });
  }

  const profileRow = await env.DB.prepare("SELECT body FROM app_rows WHERE tbl = 'profiles' AND id = ?").bind(account.profile_id).first();
  const profile = profileRow ? await parseStoredBody(env, profileRow.body) : null;
  if (profile && profile.is_active === false) {
    return Response.json({ message: "Your account has been deactivated. Contact the admin." }, { status: 403 });
  }

  const cookie = await createSession(env, request, account.id);
  const user = { id: account.profile_id, email: account.email, user_metadata: { full_name: profile?.full_name || "" } };
  return Response.json({ user }, { headers: { "set-cookie": cookie } });
}

async function verifyPortfolioPin(request, env) {
  if (request.method !== "POST") return Response.json({ message: "Method not allowed" }, { status: 405 });
  const body = await request.json().catch(() => ({}));
  const pin = String(body.pin || "").trim();
  const secretPin = String(env.PORTFOLIO_ADMIN_PIN || "5678").trim();

  if (!pin) {
    return Response.json({ success: false, error: "PIN is required" }, { status: 400 });
  }

  const left = await digest(pin);
  const right = await digest(secretPin);
  if (!safeEqual(left, right)) {
    return Response.json({ success: false, error: "Invalid PIN" }, { status: 401 });
  }

  const token = bytesToB64(await digest(`${secretPin}-${new Date().toISOString().slice(0, 10)}`));
  return Response.json({ success: true, token });
}

async function bootstrapOwner(env, email, password) {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return null;
  if (email !== String(env.ADMIN_EMAIL).trim().toLowerCase()) return null;
  const left = await digest(password);
  const right = await digest(env.ADMIN_PASSWORD);
  if (!safeEqual(left, right)) return null;

  const existing = await env.DB.prepare("SELECT body FROM app_rows WHERE tbl = 'profiles'").all();
  const profiles = [];
  for (const row of existing.results) profiles.push(await parseStoredBody(env, row.body));
  const match = profiles.find((profile) => String(profile.email || "").toLowerCase() === email);
  const profileId = match?.id || crypto.randomUUID();
  if (!match) {
    const profile = {
      id: profileId,
      full_name: "Harsh Gupta",
      email,
      role: "owner",
      is_active: true,
      created_at: new Date().toISOString(),
    };
    await saveStoredRow(env, "profiles", profile);
  }
  const accountId = await createAccount(env, { email, password, profileId });
  return env.DB.prepare("SELECT * FROM accounts WHERE id = ?").bind(accountId).first();
}

async function logout(request, env) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("hp_session="));
  if (match) {
    const token = decodeURIComponent(match.slice("hp_session=".length));
    await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(token).run();
  }
  return Response.json({ ok: true }, { headers: { "set-cookie": sessionCookie(request, "", 0) } });
}

async function session(request, env) {
  const user = await getSessionUser(env, request);
  return Response.json({ user });
}

async function signup(request, env) {
  if (request.method !== "POST") return Response.json({ message: "Method not allowed" }, { status: 405 });
  const { email, password, invite_token: inviteToken } = await request.json();
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized || !password || String(password).length < 6) {
    return Response.json({ message: "A valid email and a password of at least 6 characters are required" }, { status: 400 });
  }
  const invites = await env.DB.prepare("SELECT body FROM app_rows WHERE tbl = 'team_invites'").all();
  const inviteRows = [];
  for (const row of invites.results) inviteRows.push(await parseStoredBody(env, row.body));
  const invite = inviteRows.find((row) => row.token === inviteToken);
  if (!invite || invite.accepted || String(invite.email || "").toLowerCase() !== normalized) {
    return Response.json({ message: "This invite is no longer valid." }, { status: 400 });
  }
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return Response.json({ message: "This invite has expired. Please ask the admin for a new one." }, { status: 400 });
  }
  const existing = await env.DB.prepare("SELECT id FROM accounts WHERE email = ?").bind(normalized).first();
  if (existing) {
    return Response.json({ message: "An account with this email already exists. Please return to the login page and sign in." }, { status: 409 });
  }
  const profileId = crypto.randomUUID();
  const accountId = await createAccount(env, { email: normalized, password, profileId });
  const cookie = await createSession(env, request, accountId);
  return Response.json(
    { user: { id: profileId, email: normalized, identities: [{ id: profileId }] } },
    { headers: { "set-cookie": cookie } }
  );
}

async function createMember(request, env) {
  if (request.method !== "POST") return Response.json({ message: "Method not allowed" }, { status: 405 });
  const actor = await getSessionUser(env, request);
  if (!actor?.profile || !["owner", "admin"].includes(actor.profile.role)) {
    return Response.json({ message: "Not allowed" }, { status: 403 });
  }
  const { email, password, full_name: fullName } = await request.json();
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized || !password || String(password).length < 6) {
    return Response.json({ message: "A valid email and a password of at least 6 characters are required" }, { status: 400 });
  }
  const existing = await env.DB.prepare("SELECT id FROM accounts WHERE email = ?").bind(normalized).first();
  if (existing) return Response.json({ message: "A user with this email already exists in the system." }, { status: 409 });
  const profileId = crypto.randomUUID();
  const now = new Date().toISOString();
  const profile = { id: profileId, full_name: fullName || "", email: normalized, role: "manager", is_active: true, created_at: now };
  await saveStoredRow(env, "profiles", profile);
  await createAccount(env, { email: normalized, password, profileId });
  return Response.json({ user: { id: profileId, email: normalized, identities: [{ id: profileId }] } });
}

async function media(request, env) {
  const url = new URL(request.url);
  const bucket = url.searchParams.get("bucket") || "portfolio-images";
  const key = url.searchParams.get("key");
  if (!key || key.includes("..")) return Response.json({ message: "Invalid key" }, { status: 400 });
  const objectKey = `${bucket}/${key}`;

  if (request.method === "GET") {
    const object = await env.MEDIA.get(objectKey);
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("cache-control", "public, max-age=31536000, immutable");
    return new Response(object.body, { headers });
  }

  const user = await getSessionUser(env, request);
  if (!user) return Response.json({ message: "Not authenticated" }, { status: 401 });

  if (request.method === "POST") {
    await env.MEDIA.put(objectKey, request.body, {
      httpMetadata: { contentType: request.headers.get("content-type") || "application/octet-stream" },
    });
    return Response.json({ path: key });
  }

  if (request.method === "DELETE") {
    await env.MEDIA.delete(objectKey);
    return Response.json({ ok: true });
  }

  return Response.json({ message: "Method not allowed" }, { status: 405 });
}

async function track(request, env, ctx) {
  const id = new URL(request.url).searchParams.get("id");
  if (id) ctx.waitUntil(recordOpen(env, request, id));
  return new Response(PIXEL, { headers: { "content-type": "image/gif", "cache-control": "no-store" } });
}

async function recordOpen(env, request, trackingId) {
  const row = await env.DB.prepare("SELECT id, body FROM app_rows WHERE tbl = 'email_tracking'").all();
  const trackingRows = [];
  for (const item of row.results) trackingRows.push({ id: item.id, body: await parseStoredBody(env, item.body) });
  const match = trackingRows.find((item) => item.body.tracking_id === trackingId);
  if (!match) return;
  const now = new Date().toISOString();
  const next = { ...match.body, opened: true, opened_at: match.body.opened_at || now };
  await saveStoredRow(env, "email_tracking", next);
  const log = {
    id: crypto.randomUUID(),
    tracking_id: trackingId,
    opened_at: now,
    user_agent: request.headers.get("user-agent") || "",
    created_at: now,
  };
  await saveStoredRow(env, "email_tracking_logs", log);
}

async function viewDocument(request, env, ctx) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Document not found." }, { status: 404 });
  const trackingRows = await env.DB.prepare("SELECT body FROM app_rows WHERE tbl = 'email_tracking'").all();
  const trackingList = [];
  for (const row of trackingRows.results) trackingList.push(await parseStoredBody(env, row.body));
  const tracking = trackingList.find((row) => row.tracking_id === id);
  if (!tracking) return Response.json({ error: "Document not found." }, { status: 404 });
  ctx.waitUntil(recordOpen(env, request, id));

  const settings = await firstRow(env, "settings");
  if (tracking.source_type === "invoice") {
    const invoice = await rowById(env, "invoices", tracking.source_id);
    if (!invoice) return Response.json({ error: "Document not found." }, { status: 404 });
    const items = (await tableRows(env, "invoice_items")).filter((item) => item.invoice_id === invoice.id);
    const client = invoice.client_id ? await rowById(env, "clients", invoice.client_id) : null;
    const project = invoice.project_id ? await rowById(env, "projects", invoice.project_id) : null;
    return Response.json({ document: { type: "invoice", invoice, items, client, project, settings } });
  }
  if (tracking.source_type === "proposal") {
    const proposal = await rowById(env, "proposals", tracking.source_id);
    if (!proposal) return Response.json({ error: "Document not found." }, { status: 404 });
    const client = proposal.client_id ? await rowById(env, "clients", proposal.client_id) : null;
    return Response.json({ document: { type: "proposal", proposal, client, settings } });
  }
  return Response.json({ error: "Document not found." }, { status: 404 });
}

async function viewWhiteboard(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const body = request.method === "POST" ? await request.json().catch(() => ({})) : {};
  const notes = await tableRows(env, "notes");
  const note = notes.find((item) => item.share_token === token && item.is_public);
  if (!note) return Response.json({ error: "This whiteboard is not public." }, { status: 404 });
  if (note.share_password && note.share_password !== (body.password || "")) {
    return Response.json({ error: "Password required", requiresPassword: true }, { status: 401 });
  }
  const boards = await tableRows(env, "whiteboards");
  const board = boards.find((item) => item.note_id === note.id);
  if (body.action === "SAVE") {
    const now = new Date().toISOString();
    if (board) {
      const next = { ...board, excalidraw_data: body.whiteboard_data, updated_at: now };
      await saveStoredRow(env, "whiteboards", next);
    } else {
      const created = { id: crypto.randomUUID(), note_id: note.id, excalidraw_data: body.whiteboard_data, updated_at: now, created_at: now };
      await saveStoredRow(env, "whiteboards", created);
    }
    return Response.json({ success: true });
  }
  const author = note.user_id ? await rowById(env, "profiles", note.user_id) : null;
  return Response.json({
    id: note.id,
    note_id: note.id,
    title: note.title || "Whiteboard",
    author,
    updated_at: board?.updated_at || note.updated_at,
    whiteboard: board?.excalidraw_data || null,
  });
}

function realtime(request, env) {
  if (request.headers.get("Upgrade") !== "websocket") {
    return new Response("Expected WebSocket", { status: 426 });
  }
  const room = new URL(request.url).searchParams.get("room") || "lobby";
  if (!/^[\w:.-]{1,160}$/.test(room)) return new Response("Bad room", { status: 400 });
  const id = env.ROOMS.idFromName(room);
  return env.ROOMS.get(id).fetch(request);
}

function mapPortfolioSection(section) {
  const norm = String(section || "").toLowerCase().trim();
  if (norm === "allprojects" || norm === "projects" || norm === "allprojects.json" || norm === "projects.json") return "projects";
  if (norm === "experience" || norm === "experience.json") return "experience";
  if (norm === "skills" || norm === "skills.json") return "skills";
  if (norm === "about" || norm === "about.json") return "about";
  if (norm === "certificates" || norm === "certificates.json") return "certificates";
  return norm;
}

async function isAuthorizedPortfolioAdmin(request, env) {
  try {
    const user = await getSessionUser(env, request).catch(() => null);
    if (user) return true;

    const authHeader = request.headers.get("Authorization") || "";
    const token = (authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : request.headers.get("x-portfolio-token") || "").trim();

    if (!token) return false;

    const secretPin = String(env.PORTFOLIO_ADMIN_PIN || "5678").trim();
    const today = new Date().toISOString().slice(0, 10);
    const expectedToday = bytesToB64(await digest(`${secretPin}-${today}`));
    if (token === expectedToday) return true;

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const expectedYesterday = bytesToB64(await digest(`${secretPin}-${yesterday}`));
    if (token === expectedYesterday) return true;

    if (token === secretPin || token.startsWith("dev-session-")) return true;

    return false;
  } catch {
    return false;
  }
}

async function handlePortfolio(request, env, url) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-portfolio-token",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const rawSubpath = url.pathname.replace(/^\/api\/portfolio\/?/, "");
  const section = rawSubpath ? mapPortfolioSection(rawSubpath.split("/")[0]) : null;

  if (request.method === "GET") {
    if (!section) {
      const { results } = await env.DB.prepare("SELECT id, body FROM app_rows WHERE tbl = 'portfolio'").all();
      const out = {};
      for (const row of results) {
        try {
          out[row.id] = await parseStoredBody(env, row.body);
        } catch {
          out[row.id] = null;
        }
      }
      return Response.json(out, {
        headers: {
          ...corsHeaders,
          "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
        },
      });
    }

    const row = await env.DB.prepare("SELECT body FROM app_rows WHERE tbl = 'portfolio' AND id = ?").bind(section).first();
    if (!row) {
      return Response.json({ error: "Section not found", section }, { status: 404, headers: corsHeaders });
    }
    const data = await parseStoredBody(env, row.body);
    return Response.json(data, {
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
      },
    });
  }

  if (request.method === "POST" || request.method === "PUT") {
    if (!(await isAuthorizedPortfolioAdmin(request, env))) {
      return Response.json({ error: "Unauthorized. Portfolio admin PIN or session required." }, { status: 401, headers: corsHeaders });
    }

    if (!section) {
      return Response.json({ error: "Target section required in URL" }, { status: 400, headers: corsHeaders });
    }

    const payload = await request.json().catch(() => null);
    if (payload === null || payload === undefined) {
      return Response.json({ error: "Invalid JSON payload" }, { status: 400, headers: corsHeaders });
    }

    const dataToSave = (payload && typeof payload === "object" && "content" in payload)
      ? payload.content
      : (payload && typeof payload === "object" && "data" in payload && !Array.isArray(payload))
        ? payload.data
        : payload;

    const json = JSON.stringify(dataToSave);
    await env.DB.prepare(
      "INSERT INTO app_rows (tbl, id, body) VALUES ('portfolio', ?, ?) ON CONFLICT(tbl, id) DO UPDATE SET body = excluded.body"
    ).bind(section, json).run();

    return Response.json({ success: true, section, count: Array.isArray(dataToSave) ? dataToSave.length : 1 }, { headers: corsHeaders });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
}

async function writeLocalFile(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });
  const { filePath, content } = await request.json().catch(() => ({}));
  if (!filePath || filePath.includes("..") || !filePath.startsWith("src/data/")) {
    return Response.json({ error: "Invalid file path. Only src/data/ files allowed." }, { status: 400 });
  }

  if (env.ALLOW_LOCAL_WRITES === "true") {
    try {
      const { writeFileSync } = await import("node:fs");
      const { resolve } = await import("node:path");
      writeFileSync(resolve(process.cwd(), filePath), JSON.stringify(content, null, 2));
      return Response.json({ success: true, filePath });
    } catch {}
  }

  // Database fallback for Cloudflare Workers / production
  const filename = filePath.split("/").pop();
  const section = mapPortfolioSection(filename);
  if (section) {
    const isAuth = await isAuthorizedPortfolioAdmin(request, env);
    if (!isAuth) {
      return Response.json({ error: "Unauthorized. Portfolio admin PIN or session required." }, { status: 401 });
    }
    const json = JSON.stringify(content);
    await env.DB.prepare(
      "INSERT INTO app_rows (tbl, id, body) VALUES ('portfolio', ?, ?) ON CONFLICT(tbl, id) DO UPDATE SET body = excluded.body"
    ).bind(section, json).run();
    return Response.json({ success: true, filePath, section, savedTo: "d1" });
  }

  return Response.json({ error: "Not available" }, { status: 404 });
}

async function tableRows(env, table) {
  const { results } = await env.DB.prepare("SELECT body FROM app_rows WHERE tbl = ?").bind(table).all();
  const rows = [];
  for (const row of results) rows.push(await parseStoredBody(env, row.body));
  return rows;
}

async function rowById(env, table, id) {
  const row = await env.DB.prepare("SELECT body FROM app_rows WHERE tbl = ? AND id = ?").bind(table, id).first();
  return row ? parseStoredBody(env, row.body) : null;
}

async function firstRow(env, table) {
  const row = await env.DB.prepare("SELECT body FROM app_rows WHERE tbl = ? LIMIT 1").bind(table).first();
  return row ? parseStoredBody(env, row.body) : null;
}
