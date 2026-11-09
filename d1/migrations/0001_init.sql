CREATE TABLE app_rows (
  tbl TEXT NOT NULL,
  id TEXT NOT NULL,
  body TEXT NOT NULL,
  PRIMARY KEY (tbl, id)
);

CREATE INDEX idx_app_rows_tbl ON app_rows (tbl);

CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX idx_sessions_account ON sessions (account_id);
