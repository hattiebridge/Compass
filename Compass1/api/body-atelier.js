// Read-only bridge into Body Atelier's Neon database.
// Separate project/database from Compass's own — needs its own env var.
// Table: app_state(user_id text, key text, value jsonb, updated_at timestamptz)
//   PRIMARY KEY (user_id, key)
// Single-user app — user_id is always 'harriet'. Every feature area of
// Body Atelier is one row: key names the feature, value is that
// feature's entire state as one JSONB blob. Compass never writes here —
// read only, and only pulls the keys it actually needs.

import { neon } from "@neondatabase/serverless";

// Compass currently only surfaces the "home" key (Body Battery, recovery,
// ADHD/fibro status, hydration, pain, mood, etc.) on its Health page, but
// the other keys (movementModalities, movementState, recoveryActivities,
// recoveryState, beautyRituals, beautyState, nutritionState, progressState,
// alchemyState, nfcTriggers) are fetched too so future pages can use them
// without touching this file again.
const KEYS = [
  "home",
  "movementModalities",
  "movementState",
  "recoveryActivities",
  "recoveryState",
  "beautyRituals",
  "beautyState",
  "nutritionState",
  "progressState",
  "alchemyState",
  "nfcTriggers",
];

export default async function handler(req, res) {
  const dbUrl = process.env.BODY_ATELIER_DATABASE_URL;
  if (!dbUrl) {
    res.status(503).json({ error: "BODY_ATELIER_DATABASE_URL is not configured." });
    return;
  }
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const sql = neon(dbUrl);
    const rows = await sql`SELECT key, value, updated_at FROM app_state WHERE user_id = 'harriet'`;
    if (!rows.length) {
      res.status(200).json({ data: null, updated_at: null });
      return;
    }

    const data = {};
    let latest = null;
    for (const row of rows) {
      if (!KEYS.includes(row.key)) continue; // ignore anything unexpected, don't error
      // Value has been observed as a parsed object already (jsonb), but
      // normalize in case a row ever holds a JSON string instead.
      data[row.key] = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
      if (!latest || (row.updated_at && row.updated_at > latest)) latest = row.updated_at;
    }

    res.status(200).json({ data, updated_at: latest });
  } catch (err) {
    res.status(500).json({ error: String(err && err.message ? err.message : err) });
  }
}
