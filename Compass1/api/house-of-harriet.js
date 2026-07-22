// Read-only bridge into House of Harriet's Neon database.
// Separate project/database from Compass's own — needs its own env var.
// Table: app_state(id text, data jsonb, updated_at timestamptz)
// The single row of interest has id = 'harriet' (not 'default' like
// Compass's own table). Compass never writes here — read only.

import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  const dbUrl = process.env.HOUSE_OF_HARRIET_DATABASE_URL;
  if (!dbUrl) {
    res.status(503).json({ error: "HOUSE_OF_HARRIET_DATABASE_URL is not configured." });
    return;
  }
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const sql = neon(dbUrl);
    const rows = await sql`SELECT data, updated_at FROM app_state WHERE id = 'harriet'`;
    if (!rows.length) {
      res.status(200).json({ data: null, updated_at: null });
      return;
    }
    // House of Harriet's jsonb column has been observed holding a JSON
    // *string* rather than a parsed object in some rows — normalize either way.
    const raw = rows[0].data;
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    res.status(200).json({ data, updated_at: rows[0].updated_at });
  } catch (err) {
    res.status(500).json({ error: String(err && err.message ? err.message : err) });
  }
}
