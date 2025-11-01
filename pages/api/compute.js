import fetch from "node-fetch";

// --- simple deterministic rule-based fallback (no API needed) ---
function fallbackHoroscope({ full_name = "", dob, tob, lat, lon, tz_offset_minutes }) {
  // Safe parsing
  const date = new Date(dob + "T" + (tob || "00:00") + ":00");
  const day = isNaN(date.getTime()) ? 1 : (date.getUTCDay() || 7); // 1..7
  const hour = isNaN(date.getTime()) ? 12 : date.getHours();       // 0..23
  const nameLen = (full_name || "").trim().length || 5;
  const seed = (day * 37 + hour * 13 + Math.round((+lat || 0) + (+lon || 0)) + nameLen) % 100;

  // Tiny rule bank
  const career = [
    "kaam me clarity milegi; chhote goals set karo.",
    "networking se fayda hoga; senior se guidance lo.",
    "focus thoda bhatak sakta hai; deep-work 45 min try karo.",
    "naya skill pick karo; resume me ek line add hogi.",
    "leadership chances; apni baat calmly rakhna."
  ];
  const love = [
    "baat-cheet me softness rakho; ego avoid karo.",
    "old message yaad aayega; mature reply karo.",
    "family time se bonding strong hogi.",
    "past ko park karo; present me invest karo.",
    "honest appreciation do; magic dikhai dega."
  ];
  const health = [
    "paani zyada piyo; 15-min walk ka vow lo.",
    "late-night screen time kam karo; neend better hogi.",
    "light stretching & surya namaskar help karega.",
    "overeating avoid; simple satvik khana choose karo.",
    "mind ko calm rakhne ko 5-min deep breathing karo."
  ];

  const pick = (arr, n) => arr[n % arr.length];
  const h = `Career: ${pick(career, seed)}\nLove: ${pick(love, seed+7)}\nHealth: ${pick(health, seed+14)}\n(Confidence: Medium — rule-based reading)`;

  const bullets = [];
  if (hour >= 5 && hour <= 10) bullets.push("Subah janam — discipline aur sunrise energy strong.");
  if (hour >= 11 && hour <= 15) bullets.push("Din ka janam — public image & pragati pe focus.");
  if (hour >= 16 && hour <= 20) bullets.push("Shaam janam — relationships & collaboration me growth.");
  if (hour >= 21 || hour <= 4)  bullets.push("Raat janam — intuition & research me strength.");

  if ((+lon || 0) > 75) bullets.push("East-longitude signal — fast decision lena faydemand.");
  if ((+lat || 0) > 25) bullets.push("Uttar disha signal — learning/study se uplift.");
  if (nameLen % 2 === 0) bullets.push("Name-vibration: even — stability; odd — creativity.");

  return { horoscope: h, bullets };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { full_name, dob, tob, lat, lon, tz_offset_minutes } = req.body || {};
  if (!dob || !tob || !lat || !lon) {
    return res.status(400).json({ error: "Missing fields: dob, tob, lat, lon required" });
  }

  const key = process.env.OPENAI_API_KEY?.trim();

  // If no API key, return fallback immediately
  if (!key) {
    const fb = fallbackHoroscope({ full_name, dob, tob, lat, lon, tz_offset_minutes });
    return res.status(200).json({ raw_model: "", ...fb });
  }

  // With API key → try GPT; on error, fall back gracefully
  try {
    const userPrompt = `You are an expert Vedic astrology assistant.
Birth:
- Name: ${full_name || "N/A"}
- Date: ${dob}  Time: ${tob}
- Lat: ${lat}  Lon: ${lon}  TZ(min): ${tz_offset_minutes || "unknown"}
Task:
1) 3-4 lines Hinglish horoscope (career, love, health) — warm & human.
2) Return JSON: {"horoscope": "...", "bullets": ["..."]}. No extra text. Short, practical lines.`;

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful astrology assistant." },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 400,
        temperature: 0.6
      })
    });

    const data = await r.json();
    if (!r.ok) {
      // Fallback on any OpenAI error
      const fb = fallbackHoroscope({ full_name, dob, tob, lat, lon, tz_offset_minutes });
      return res.status(200).json({ raw_model: "", ...fb, note: data?.error?.message || "fallback" });
    }

    const text = data?.choices?.[0]?.message?.content || "";
    let parsed = null; try { parsed = JSON.parse(text); } catch {}
    if (!parsed?.horoscope) {
      const fb = fallbackHoroscope({ full_name, dob, tob, lat, lon, tz_offset_minutes });
      return res.status(200).json({ raw_model: text, ...fb, note: "fallback-parse" });
    }
    return res.status(200).json({ raw_model: text, horoscope: parsed.horoscope, bullets: parsed.bullets || [] });
  } catch (e) {
    const fb = fallbackHoroscope({ full_name, dob, tob, lat, lon, tz_offset_minutes });
    return res.status(200).json({ raw_model: "", ...fb, note: "fallback-error" });
  }
}
