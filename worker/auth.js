import { parseStoredBody } from "./db.js";

const SESSION_DAYS = 30;

export async function hashPassword(password, saltBytes) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: 100000, hash: "SHA-256" },
    key,
    256
  );
  return bytesToB64(new Uint8Array(bits));
}

export function bytesToB64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function b64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function digest(value) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return new Uint8Array(buf);
}

export function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export function readCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function sessionCookie(request, token, maxAge) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `hp_session=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export async function createSession(env, request, accountId) {
  const id = crypto.randomUUID();
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  await env.DB.prepare("INSERT INTO sessions (id, account_id, expires_at) VALUES (?, ?, ?)").bind(id, accountId, expires).run();
  return sessionCookie(request, id, SESSION_DAYS * 86400);
}

export async function getSessionUser(env, request) {
  const token = readCookie(request, "hp_session");
  if (!token) return null;
  const session = await env.DB.prepare(
    "SELECT s.id, s.expires_at, a.profile_id, a.email FROM sessions s JOIN accounts a ON a.id = s.account_id WHERE s.id = ?"
  ).bind(token).first();
  if (!session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) {
    await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(token).run();
    return null;
  }
  const profile = await env.DB.prepare("SELECT body FROM app_rows WHERE tbl = 'profiles' AND id = ?").bind(session.profile_id).first();
  const parsed = profile ? await parseStoredBody(env, profile.body) : null;
  return {
    id: session.profile_id,
    email: session.email,
    user_metadata: { full_name: parsed?.full_name || "" },
    profile: parsed,
  };
}

export async function verifyPassword(password, account) {
  const hash = await hashPassword(password, b64ToBytes(account.password_salt));
  const left = await digest(hash);
  const right = await digest(account.password_hash);
  return safeEqual(left, right);
}

export async function createAccount(env, { email, password, profileId }) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordHash = await hashPassword(password, salt);
  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO accounts (id, profile_id, email, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(id, profileId, email, passwordHash, bytesToB64(salt), new Date().toISOString()).run();
  return id;
}
