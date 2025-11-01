import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { full_name, dob, tob, lat, lon, tz_offset_minutes } = req.body || {};
  if (!dob || !tob || !lat || !lon) {
    return res.status(400).json({ error: "Missing fields: dob, tob, lat, lon required" });
  }

  const userPrompt = `You are an expert Vedic astrology assistant. Given birth details:
Name: ${full_name || "N/A"}
DOB: ${dob}, TOB: ${tob}, Lat: ${lat}, Lon: ${lon}, TZ: ${tz_offset_minutes || "unknown"}
1) Give 3-4 line Hinglish horoscope (career, love, health).
2) Return JSON with keys: horoscope (string), bullets (array of short strings).
Keep tone human and helpful; avoid absolute predictions.`;

  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return res.status(500).json({ error: "OPENAI_API_KEY not set" });

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: "You are a helpful astrology assistant." }, { role: "user", content: userPrompt }],
        max_tokens: 400,
        temperature: 0.6
      })
    });
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content || "";
    let parsed = null; try { parsed = JSON.parse(text); } catch {}
    res.status(200).json({ raw_model: text, horoscope: parsed?.horoscope || text, bullets: parsed?.bullets || [] });
  } catch (e) {
    res.status(500).json({ error: e.message || "Unknown error" });
  }
}
