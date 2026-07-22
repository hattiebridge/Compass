// Vercel serverless function: GET/POST the single Compass state blob
// to Neon Postgres. Keeps the DB credentials server-side only — the
// client never sees the connection string.
//
// Env var required: DATABASE_URL (set automatically if you use the
// Vercel <-> Neon integration, or paste your Neon connection string
// manually in Vercel project settings -> Environment Variables).

import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    res.status(503).json({ error: "DATABASE_URL is not configured yet." });
    return;
  }
  const sql = neon(dbUrl);

  try {
    if (req.method === "GET") {
      const rows = await sql`SELECT data, updated_at FROM compass_state WHERE id = 'default'`;
      if (!rows.length) {
        res.status(200).json({ data: null, updated_at: null });
        return;
      }
      res.status(200).json({ data: rows[0].data, updated_at: rows[0].updated_at });
      return;
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!body || typeof body !== "object") {
        res.status(400).json({ error: "Expected a JSON object body." });
        return;
      }
      await sql`
        INSERT INTO compass_state (id, data, updated_at)
        VALUES ('default', ${JSON.stringify(body)}::jsonb, now())
        ON CONFLICT (id) DO UPDATE SET data = ${JSON.stringify(body)}::jsonb, updated_at = now()
      `;
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    res.status(500).json({ error: String(err && err.message ? err.message : err) });
  }
}
