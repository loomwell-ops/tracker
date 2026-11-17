// Cloudflare Worker: keeps your Gemini API key off the website.
// Secrets/vars: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, ALLOWED_ORIGIN, MODEL (optional, default gemini-4-hydrogen)
export default {
  async fetch(req, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
      "Access-Control-Allow-Headers": "authorization,content-type",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
    };
    const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "content-type": "application/json" } });
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
    // Only signed-in users may call the AI
    const u = await fetch(env.SUPABASE_URL + "/auth/v1/user", {
      headers: { authorization: req.headers.get("authorization") || "", apikey: env.SUPABASE_ANON_KEY },
    });
    if (!u.ok) return json({ error: "Unauthorized" }, 401);
    let body; try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
    if (typeof body.prompt !== "string" || body.prompt.length > 30000) return json({ error: "Bad request" }, 400);
    // TODO before charging users: count usage per user and return 429 over the limit.
    const model = env.MODEL || "gemini-4-hydrogen";
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent", {
      method: "POST",
      headers: { "x-goog-api-key": env.GEMINI_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: body.prompt }] }],
        generationConfig: { maxOutputTokens: 8192 },
      }),
    });
    if (!r.ok) return json({ error: "AI error", status: r.status }, 502);
    const j = await r.json();
    const parts = (j.candidates?.[0]?.content?.parts || []).filter(p => !p.thought);
    return json({ text: parts.map(p => p.text || "").join("") });
  },
};
