-- Compass — Neon Postgres schema
-- Single-user prototype: one row holds the entire app state as JSONB,
-- mirroring the shape already used in localStorage (see defaultState()
-- in app.js). This keeps the API trivial and avoids a big relational
-- migration for what is currently a single-person app; it can be split
-- into proper normalised tables later if Compass grows multi-user.

CREATE TABLE IF NOT EXISTS compass_state (
  id text PRIMARY KEY DEFAULT 'default',
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed an empty row so the first GET has something to return.
-- (Safe to run multiple times.)
INSERT INTO compass_state (id, data)
VALUES ('default', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
