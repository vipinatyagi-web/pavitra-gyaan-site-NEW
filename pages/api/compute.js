import fetch from "node-fetch";

function fmtDateHuman(dob){ try{ const [y,m,d]=dob.split("-").map(Number); return new Date(Date.UTC(y,m-1,d)).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});}catch{return dob;} }
function fmtTimeHuman(t){ try{ const [H,M]=t.split(":").map(Number); const d=new Date(); d.setHours(H); d.setMinutes(M||0); return d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});}catch{return t;} }
function tzLabel(mins){ const m=parseInt(mins||0,10); if(m===330) return "IST (UTC+05:30)"; const s=m>=0?"+":"-"; const h=Math.floor(Math.abs(m)/60), mm=Math.abs(m)%60; return `UTC${s}${String(h).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;}
function seeded(str){ let h=2166136261>>>0; for(let i=0;i<str.length;i++) h=Math.imul(h^str.charCodeAt(i),16777619)>>>0; return n=>((h=Math.imul(h,1664525)+1013904223>>>0)%n); }

function fallbackDetailed(payload){
  const { full_name="", dob, tob, lat, lon, tz_offset_minutes, extra={} } = payload;
  const pick = seeded(`${full_name}|${dob}|${tob}|${lat}|${lon}|${Object.values(extra).join("|")}`);

  const tone = ["calm mind + sharp action","discipline → seedha phal","rukavat hat rahi — momentum","front-foot with softness","learning → breakthrough"][pick(5)];
  const para = (a)=>a.join(" ");

  const bias = (key,val)=> val? `User context (${key}: ${val}) ko dhyan me rakhte hue` : "Context ke hisaab se";
  const cGoal = extra.career_goal || "Progress";
  const hFocus = extra.health_focus || "Energy";
  const topC = extra.top_concern || "Clarity";
  const horizon = extra.time_horizon || "Next 90 days";

  const sections = {
    career: {
      headline: `${cGoal} • ${horizon}`,
      indicators: [
        `${bias("career_stage", extra.career_stage)} structured routine zaruri.`,
        "Visibility + documentation tumhari strength ko showcase karega."
      ],
      forensic: para([
        `Analysis: ${topC} dominant lag raha hai. Morning 10:00–13:00 (local) highest output window.`,
        "Repeatable systems nahi hone se momentum toot jata hai; weekly 'wins note' rakho.",
      ]),
      pinpoint: ["Interview outreach: Tue/Thu 11:30–13:00", "Deep work: Mon/Wed/Fri 10:00–11:30", "Networking DM: Sat 7:30–8:00 PM"],
      actions: [
        "Aaj: 3 deliverables likh ke 5 PM tak share.",
        "7-din: ek tool (Excel/SQL/AI) par 20-min/day practice; 2 outcomes capture.",
        "90-din: 2 case-results ready rakho appraisal/HR talk ke liye."
      ],
      confidence: "High"
    },
    money: {
      headline: extra.money_goal || "Money discipline",
      indicators: ["Cash-flow volatility; system se control.", "70-20-10 rule helpful."],
      forensic: "Subscriptions review karo; impulse cart clear. SIP se stability.",
      actions: ["Salary day D+1 ko auto-transfer 10%.", "Weekly discretionary cap set karo (₹)."],
      confidence: "Medium"
    },
    love: {
      headline: `${extra.relationship_status} — Communication first`,
      indicators: ["Empathy high, conflict avoidance bhi.", "Family time improves bonding."],
      forensic: "Heart-to-heart windows: Sun 6–8 PM; Wed night short walk.",
      actions: ["Aaj: ek appreciative message.", "Is week: 20-min no-screens talk (agenda: feelings → plan)."],
      confidence: "Medium-High"
    },
    health: {
      headline: `${hFocus} • Sleep hygiene`,
      indicators: ["Late-night screens; circadian drain.", "Digestive variability possible."],
      forensic: "3–5 PM energy dip ho to 10-min walk + 200ml water exactly at 3 PM.",
      actions: ["Daily: 10-min morning sun; post-lunch 15-min walk.", "Tonight: 10:30 PM ke baad screens off; 7-step wind-down."],
      confidence: "Medium"
    },
    family: {
      headline: "Small rituals restore harmony",
      indicators: ["Elders blessing uplift.", "Practical help > advice."],
      forensic: "Weekly one call with elders (specific updates).",
      actions: ["Ghar ka ek kaam adopt karo.", "Joint decisions → calmly summarise."],
      confidence: "Medium"
    },
    education: {
      headline: extra.career_stage==="Student" ? "Exam clarity" : "Skill-up ROI",
      indicators: ["45-min deep focus blocks.", "Notes → Q/A cards."],
      forensic: "Mock tests se weak areas identify; curated playlist use karo.",
      actions: ["8-week plan banao.", "Ek certified cohort join karo."],
      confidence: "Medium"
    },
    travel: {
      headline: "Short reflective trip",
      indicators: ["Nature/temple reset.", "Budget discipline first."],
      forensic: "NE direction short trip productive.",
      actions: ["Next 60 din me 1–2 day trip plan karo."],
      confidence: "Low-Medium"
    },
    spiritual: {
      headline: extra.spiritual_inclination,
      indicators: ["Micro-practice roz ki.", "Consistency >>> intensity."],
      forensic: "Bhakti + discipline → decision clarity.",
      actions: ["Gayatri 11x subah (10 days).", "Ravivar ghee diya 11-min."],
      confidence: "High"
    }
  };

  const remedies = [
    "Daily: 5-min pranayama before bed",
    "Weekly: one act of seva/charity",
    "Ravivar: Surya ko jal + gratitude list"
  ];
  const timelines = [
    { window: "Next 7 days", focus: "Close 2 small deliverables", tip: "2×45-min blocks" },
    { window: "Next 30 days", focus: `${horizon} ke liye systems`, tip: "weekly review Sun 7 PM" },
    { window: "Next 90 days", focus: "Financial stability", tip: "SIP + emergency fund" }
  ];
  const dos_donts = {
    do: ["Morning routine fix", "Weekly goals visible", "Gratitude first"],
    avoid: ["Late-night scrolling", "Impulse spend", "Silent treatment"]
  };

  return {
    meta: { full_name, dob_human: fmtDateHuman(dob), tob_human: fmtTimeHuman(tob), tz_label: tzLabel(tz_offset_minutes), lat, lon },
    summary: `Forensic reading (focus: ${extra.top_concern || "Clarity"}). Overall energy: ${tone}.`,
    sections,
    remedies,
    timelines,
    dos_donts,
    lucky: { number: (seeded(full_name)(90)+10), color: ["Emerald","Kesariya","Royal Blue","Maroon","White"][seeded(dob)(5)], day: ["Somvaar","Mangalvaar","Budhvaar","Guruvar","Shukravaar","Shanivaar","Ravivaar"][seeded(tob)(7)] },
    note: "Deterministic rule-engine. More precision via Swiss Ephemeris/GPT available."
  };
}

function buildOpenAIPrompt(payload){
  const { full_name="", dob, tob, lat, lon, tz_offset_minutes, extra={} } = payload;
  return `
You are a professional Vedic consultant. Generate a forensic, highly-detailed Hinglish reading with JSON only.
User context: ${JSON.stringify(extra)}
Birth: Name=${full_name||"N/A"}, Date=${dob}, Time=${tob}, Lat=${lat}, Lon=${lon}, TZ(min)=${tz_offset_minutes||"unknown"}

Return strict JSON:
{
 "meta": {...},
 "summary": "...",
 "sections": {
   "career": {"headline":"...","indicators":["..."],"forensic":"...","pinpoint":["..."],"actions":["today...","7-day...","90-day..."],"confidence":"High/Medium/Low"},
   "love": {...}, "health": {...}, "money": {...}, "education": {...}, "family": {...}, "spiritual": {...}, "travel": {...}
 },
 "remedies": ["..."],
 "timelines": [{"window":"Next 7 days","focus":"...","tip":"..."}],
 "dos_donts": {"do":["..."],"avoid":["..."]},
 "lucky": {"number":12,"color":"...","day":"..."},
 "confidence_overall":"High/Medium/Low",
 "note":"assumptions if any"
}
Write empathetic, precise lines. Do not invent numeric planet degrees. JSON only.
`;
}

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  const { full_name, dob, tob, lat, lon, tz_offset_minutes, extra } = req.body || {};
  if(!dob || !tob || !lat || !lon) return res.status(400).json({error:"Missing fields: dob, tob, lat, lon required"});

  const KEY = process.env.OPENAI_API_KEY?.trim();
  if(!KEY){
    const out = fallbackDetailed({ full_name, dob, tob, lat, lon, tz_offset_minutes, extra });
    return res.status(200).json(out);
  }

  try{
    const prompt = buildOpenAIPrompt({ full_name, dob, tob, lat, lon, tz_offset_minutes, extra });
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method:"POST",
      headers:{ Authorization:`Bearer ${KEY}`, "Content-Type":"application/json" },
      body: JSON.stringify({
        model:"gpt-4o-mini",
        messages:[{role:"system",content:"You output strict JSON only."},{role:"user",content:prompt}],
        temperature:0.4, max_tokens: 1200
      })
    });
    const j = await r.json();
    if(!r.ok){
      const out = fallbackDetailed({ full_name, dob, tob, lat, lon, tz_offset_minutes, extra });
      out.note = "OpenAI error: " + (j?.error?.message || r.statusText);
      return res.status(200).json(out);
    }
    const text = j?.choices?.[0]?.message?.content || "";
    const cleaned = text.replace(/^\s*```(?:json)?\s*/i,"").replace(/\s*```\s*$/i,"").trim();
    try{
      const parsed = JSON.parse(cleaned);
      return res.status(200).json(parsed);
    }catch(e){
      const out = fallbackDetailed({ full_name, dob, tob, lat, lon, tz_offset_minutes, extra });
      out.raw_model = cleaned;
      out.note = "Model JSON parse failed → fallback used.";
      return res.status(200).json(out);
    }
  }catch(err){
    const out = fallbackDetailed({ full_name, dob, tob, lat, lon, tz_offset_minutes, extra });
    out.note = "Server error: " + (err.message || "unknown");
    return res.status(200).json(out);
  }
}
