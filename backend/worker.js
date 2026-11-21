// LoomwellOps AI Worker (streaming). Uses your existing variables:
// Secrets: GEMINI_API_KEY, SUPABASE_ANON_KEY | Vars: SUPABASE_URL, ALLOWED_ORIGIN, MODEL (optional)
// Optional var THINKING_BUDGET (e.g. 0 for Flash models) makes replies start faster.
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

    const u = await fetch(env.SUPABASE_URL + "/auth/v1/user", {
      headers: { authorization: req.headers.get("authorization") || "", apikey: env.SUPABASE_ANON_KEY },
    });
    if (!u.ok) return json({ error: "Unauthorized", supabase_status: u.status }, 401);
    const uid = (await u.json()).id;

    let body; try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
    // Daily AI limit per user. Needs a KV namespace bound as USAGE; optional var DAILY_LIMIT (default 30).
    if (env.USAGE) {
      const k = "u:" + uid + ":" + new Date().toISOString().slice(0, 10), n = +(await env.USAGE.get(k) || 0), lim = +(env.DAILY_LIMIT || 30);
      if (n >= lim) return json({ error: "Daily AI limit reached (" + lim + "). Try again tomorrow." }, 429);
      await env.USAGE.put(k, String(n + 1), { expirationTtl: 172800 });
    }
    if (typeof body.url === "string") {
      let url; try { url = new URL(body.url); } catch { return json({ error: "That is not a valid link" }, 400); }
      const bad = h => /^(localhost|.*\.(local|internal|localdomain))$/i.test(h) || /^[\d.]+$/.test(h) || h.includes(":") || h.startsWith("[");
      if (url.protocol !== "https:" || url.port || bad(url.hostname)) return json({ error: "Link not allowed" }, 400);
      let html = "";
      try {
        let cu = url, pr;
        for (let i = 0; i < 4; i++) {
          pr = await fetch(cu, { headers: { "user-agent": "Mozilla/5.0 (compatible; LoomwellOps/1.0)", accept: "text/html" }, redirect: "manual" });
          const lo = pr.headers.get("location");
          if (pr.status >= 300 && pr.status < 400 && lo) { cu = new URL(lo, cu); if (cu.protocol !== "https:" || cu.port || bad(cu.hostname)) return json({ error: "Link not allowed" }, 400); continue; }
          break;
        }
        if (!pr.ok) return json({ error: "The site returned " + pr.status + ". Paste the description instead." }, 502);
        html = (await pr.text()).slice(0, 600000);
      } catch { return json({ error: "Could not open that link" }, 502); }
      const ld = [...html.matchAll(/<script[^>]*ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join("\n").slice(0, 12000);
      const text = html.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().slice(0, 20000);
      if (text.length < 300 && ld.length < 100) return json({ error: "This site hides its postings from automatic reading (LinkedIn and Indeed often do). Paste the description instead." }, 422);
      const ex = 'Extract the job posting from this page. Reply with ONLY JSON: {"title":"","company":"","pay":"","description":""}. "description" is the full posting text (responsibilities, requirements, schedule) cleaned up, no site menus. Use "" for anything not stated. Never invent.\nSTRUCTURED DATA:\n' + ld + "\nPAGE TEXT:\n" + text;
      const gr = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + (env.MODEL || "gemini-2.5-flash") + ":generateContent", {
        method: "POST", headers: { "x-goog-api-key": env.GEMINI_API_KEY, "content-type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: ex }] }], generationConfig: { maxOutputTokens: 8192, responseMimeType: "application/json" } }),
      });
      if (!gr.ok) return json({ error: "AI error", status: gr.status }, 502);
      const gj = await gr.json();
      try {
        const raw = (gj.candidates?.[0]?.content?.parts || []).filter(p => !p.thought).map(p => p.text || "").join("");
        const o = JSON.parse(raw.replace(/^```json|```$/g, ""));
        return json({ title: o.title || "", company: o.company || "", pay: o.pay || "", description: o.description || "" });
      } catch { return json({ error: "Could not read that posting. Paste the description instead." }, 502); }
    }
    if (typeof body.prompt !== "string" || body.prompt.length > 40000) return json({ error: "Bad request" }, 400);

    const model = env.MODEL || "gemini-2.5-flash";
    const generationConfig = { maxOutputTokens: 8192 };
    if (env.THINKING_BUDGET !== undefined && env.THINKING_BUDGET !== "")
      generationConfig.thinkingConfig = { thinkingBudget: Number(env.THINKING_BUDGET) };

    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":streamGenerateContent?alt=sse",
      {
        method: "POST",
        headers: { "x-goog-api-key": env.GEMINI_API_KEY, "content-type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: body.prompt }] }], generationConfig }),
      }
    );
    if (r.status === 429) return json({ error: "Rate limited" }, 429);
    if (!r.ok) return json({ error: "AI error", status: r.status, detail: (await r.text()).slice(0, 300) }, 502);

    // Turn Gemini's event stream into plain text chunks the app can show live
    const dec = new TextDecoder(), enc = new TextEncoder();
    let buf = "";
    const ts = new TransformStream({
      transform(chunk, ctl) {
        buf += dec.decode(chunk, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop();
        for (const l of lines) {
          if (!l.startsWith("data:")) continue;
          try {
            const j = JSON.parse(l.slice(5));
            const t = (j.candidates?.[0]?.content?.parts || []).filter(p => !p.thought).map(p => p.text || "").join("");
            if (t) ctl.enqueue(enc.encode(t));
          } catch {}
        }
      },
    });
    return new Response(r.body.pipeThrough(ts), { headers: { ...cors, "content-type": "text/plain; charset=utf-8" } });
  },
};
