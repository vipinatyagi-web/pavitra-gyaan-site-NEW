// No external API required. Deterministic, pandit-style rule engine.

function fmtDateHuman(dob) {
  // dob = "YYYY-MM-DD"
  try {
    const [y,m,d] = dob.split("-").map(Number);
    const date = new Date(Date.UTC(y, m-1, d));
    return date.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
  } catch { return dob; }
}
function fmtTimeHuman(tob24) {
  // "HH:MM" -> "hh:mm AM/PM"
  try {
    const [H, M] = tob24.split(":").map(Number);
    const d = new Date(); d.setHours(H); d.setMinutes(M||0);
    return d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
  } catch { return tob24; }
}
function tzLabel(mins) {
  const m = parseInt(mins||0,10);
  if (m === 330) return "IST (UTC+05:30)";
  const sign = m >= 0 ? "+" : "-";
  const h = Math.floor(Math.abs(m)/60);
  const mm = Math.abs(m)%60;
  return `UTC${sign}${String(h).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;
}

function seeded(name, dob, tob, lat, lon) {
  const str = `${name}|${dob}|${tob}|${lat}|${lon}`;
  // simple xorshift-ish
  let h = 0;
  for (let i=0;i<str.length;i++) h = (h*131 + str.charCodeAt(i)) >>> 0;
  return (n) => (h = (1103515245*h + 12345) >>> 0) % n;
}

function buildReading(payload) {
  const { full_name="", dob, tob, lat, lon, tz_offset_minutes } = payload;
  const pick = seeded(full_name, dob, tob, lat, lon);

  // Buckets
  const tones = [
    "ziddi goals ko bhi warmth se hasil karoge",
    "mehnat ka seedha phal milega, lekin discipline zaruri",
    "calm mind + sharp action se progress tez",
    "jo cheez ruk rahi thi, ab smoothly aage badhegi",
    "naye mauke front foot pe milenge — bas shisht bol-chal rakho"
  ];
  const career = [
    "10th-house energy jaise leadership vibes — apni baat confidently rakho.",
    "colleague support strong — team me visibility banao.",
    "skill upgrade (Excel/SQL/AI) se next ladder jaldi milega.",
    "job change soch rahe ho to profile polish karo, 2 high-quality applications bhejo.",
    "client-facing kaam me gentle but firm rehna — trust build hoga."
  ];
  const money = [
    "fixed खर्च control karo; SIP/FD se stability lao.",
    "impulsive kharche avoid; 70-20-10 rule follow karo.",
    "digital tools (expense tracker) se paisa bachao.",
    "emi prepayment ka ek chhota target set karo.",
    "part-time skill se side income ka ek seed lagao."
  ];
  const love = [
    "soft tone + active listening se misunderstandings door.",
    "single? common-values waale logon se connect banta dikhega.",
    "married couples ke liye short evening walk magic karega.",
    "ego ko thoda park karo — appreciation first policy.",
    "boundaries clear rakhte hue bhi pyaar dikhana zaruri."
  ];
  const health = [
    "15-min surya namaskar + 8 glass paani — baseline perfect.",
    "screen-time curfew rakho (11 PM ke baad nahi).",
    "gut-friendly satvik diet: khichdi / dahi / ghee right now.",
    "back/neck ke liye micro-break stretching alarms lagao.",
    "mind ko calm rakhne ko 5-min box breathing."
  ];
  const family = [
    "parents/elders se 10-min call — blessings uplift deti hain.",
    "ghar me ek chhota diya/agarbatti roz ka ritual banao.",
    "siblings ke saath bad jokes bhi bonding heal karta hai.",
    "ghar ke kisi ek kaam ki responsibility low-drama mein le lo.",
    "joint decision me sabki suno, aakhir me calmly summarise karo."
  ];
  const edu = [
    "daily 45-min deep focus slot fix karo; phone silent.",
    "notes ko smart cards (Q/A) me convert karo.",
    "mock tests se reality check — weak area pe double down.",
    "YouTube/playlist se curated learning — random scrolling nahi.",
    "mentor/peer group ke saath weekly check-in rakho."
  ];
  const travel = [
    "short temple visit ya nature walk se mind reset.",
    "office commute me podcast/audio-gita useful rahega.",
    "yatra plan me budget pehle lock; impulsive add-ons avoid.",
    "north-east direction ke short trips light aur productive.",
    "solo reflection trip se clarity boost milega."
  ];
  const spiritual = [
    "Gayatri mantra 11 बार subah — mann me shanti aur focus.",
    "Shiv Panchakshari (ॐ नमः शिवाय) 108 — vaani me madhurta.",
    "Hanuman Chalisa mool — protection & courage uplift.",
    "Tulsi ko jal & deep daan — grih shakti strong.",
    "geeta ka ek shlok roz — decision me clarity."
  ];
  const remedies = [
    "pehli roti gau-mata ke liye; karmic shuddhi.",
    "sunday ko Surya ko jal + आदित्य हृदय स्तोत्र.",
    "mangalwar ko 11 deep daan — obstacles कम.",
    "budhwar ko kanjak/kanya ko meetha prasad.",
    "dakshin-abhimuk deepak shaniwaar ko 11-min."
  ];
  const luckyColor = ["Kesariya", "Peacock Blue", "Maroon", "Emerald", "White", "Royal Blue", "Turquoise"];
  const luckyDay = ["Somvaar", "Mangalvaar", "Budhvaar", "Guruvar", "Shukravaar", "Shanivaar", "Ravivaar"];

  // Deterministic picks
  const tone = tones[pick(tones.length)];
  const sec = (arr, n=1) => Array.from({length:n}, (_,i)=>arr[pick(arr.length+i)]);
  const [c1,c2] = sec(career,2);
  const [m1] = sec(money,1);
  const [l1] = sec(love,1);
  const [h1] = sec(health,1);
  const [f1] = sec(family,1);
  const [e1] = sec(edu,1);
  const [t1] = sec(travel,1);
  const [s1] = sec(spiritual,1);
  const rems = sec(remedies,3);
  const lucky = {
    number: (pick(90)+10), // 10..99
    color: luckyColor[pick(luckyColor.length)],
    day: luckyDay[pick(luckyDay.length)]
  };

  const istMeta = {
    full_name,
    dob_human: fmtDateHuman(dob),
    tob_human: fmtTimeHuman(tob),
    tz_label: tzLabel(tz_offset_minutes),
    lat, lon
  };

  const summary = `Aaj ki overall energy: ${tone}. Apni language me softness rakhte hue
focused action loge to परिणाम साफ दिखेगा. Jo kaam अटका था, usme
चोटे-चोटे measurable steps rakho — progress self-evident ہوگی.`;

  const sections = {
    career: `${c1} Aur ${c2}`,
    money: m1,
    love: l1,
    health: h1,
    family: f1,
    education: e1,
    travel: t1,
    spiritual: s1
  };

  const timelines = [
    { window: "Next 7 days", focus: "files/loose ends close karo", tip: "2 tasks per day rule" },
    { window: "Next 30 days", focus: "skill upgrade + networking", tip: "3 seniors ko value-DM" },
    { window: "Next 90 days", focus: "financial discipline", tip: "70-20-10 spending rule" }
  ];

  const dos_donts = {
    do: ["subah jaldi uthna", "45-min deep work", "soft communication", "daily prarthana"],
    avoid: ["late-night doomscrolling", "impulsive kharche", "ego arguments", "neglecting water"]
  };

  return {
    meta: istMeta,
    summary,
    sections,
    remedies: rems,
    lucky,
    timelines,
    dos_donts
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { full_name, dob, tob, lat, lon, tz_offset_minutes } = req.body || {};
  if (!dob || !tob || !lat || !lon) {
    return res.status(400).json({ error: "Missing fields: dob, tob, lat, lon required" });
  }

  try {
    const payload = { full_name, dob, tob, lat, lon, tz_offset_minutes };
    const out = buildReading(payload);
    return res.status(200).json(out);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Unknown error" });
  }
}
