import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    full_name: "Vipin",
    dob: "1993-02-02",          // YYYY-MM-DD
    tob: "10:00",               // 24h
    lat: "29.3909",
    lon: "76.9635",
    tz_offset_minutes: "330"    // IST by default
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Auto-IST helper label
  const istLabel = useMemo(() => {
    const m = parseInt(form.tz_offset_minutes || "330", 10);
    return m === 330 ? "IST (UTC+05:30)" : `UTC${m >= 0 ? "+" : ""}${(m/60).toFixed(2)}`;
  }, [form.tz_offset_minutes]);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function setIST() {
    setForm({ ...form, tz_offset_minutes: "330" });
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/compute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Server error");
      setResult(j);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui, Inter, Arial", background:"#fff", minHeight:"100vh" }}>
      <header style={{padding:"28px 16px 8px", textAlign:"center"}}>
        <h1 style={{margin:0, fontSize:36}}>🕉️ Pavitra Gyaan — Kundali & Horoscope</h1>
        <p style={{margin:"6px 0 0", color:"#666"}}>Indian audience ke liye IST-friendly, detailed, pandit-style reading</p>
      </header>

      <main style={{maxWidth:980, margin:"18px auto", padding:"0 16px"}}>
        {/* CARD: Form */}
        <section style={{
          background:"#f6f6f7", border:"1px solid #ececf0", borderRadius:16, padding:18
        }}>
          <form onSubmit={submit}>
            <div style={{display:"grid", gridTemplateColumns:"1fr", gap:10}}>
              <input name="full_name" value={form.full_name} onChange={update}
                     placeholder="Full Name" style={inputStyle}/>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
                <input name="dob" type="date" value={form.dob} onChange={update} style={inputStyle}/>
                <input name="tob" type="time" value={form.tob} onChange={update} style={inputStyle}/>
              </div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
                <input name="lat" value={form.lat} onChange={update} placeholder="Latitude" style={inputStyle}/>
                <input name="lon" value={form.lon} onChange={update} placeholder="Longitude" style={inputStyle}/>
              </div>

              <div style={{display:"grid", gridTemplateColumns:"1fr auto", gap:10, alignItems:"center"}}>
                <input name="tz_offset_minutes" value={form.tz_offset_minutes} onChange={update}
                       placeholder="TZ offset in minutes (IST=330)" style={inputStyle}/>
                <button type="button" onClick={setIST} style={ghostBtn}>Set IST</button>
              </div>

              <div style={{fontSize:12, color:"#666"}}>
                Time zone: <b>{istLabel}</b> • Indian users ke liye default <b>330 (IST)</b> sahi rahega.
              </div>

              <div style={{display:"flex", gap:10, alignItems:"center"}}>
                <button disabled={loading} style={primaryBtn}>{loading ? "Calculating…" : "Generate"}</button>
              </div>
            </div>
          </form>
        </section>

        {/* RESULTS */}
        {result && (
          <>
            {/* META */}
            <section style={{marginTop:18}}>
              <h2 style={h2}>Janma Vivaran</h2>
              <div style={cardsGrid}>
                <MetaCard label="Naam" value={result?.meta?.full_name}/>
                <MetaCard label="Janma Tithi" value={result?.meta?.dob_human}/>
                <MetaCard label="Janma Samay" value={`${result?.meta?.tob_human} (${result?.meta?.tz_label})`}/>
                <MetaCard label="Sthal (Lat, Lon)" value={`${result?.meta?.lat}, ${result?.meta?.lon}`}/>
              </div>
            </section>

            {/* SUMMARY */}
            <section style={{marginTop:18}}>
              <h2 style={h2}>Saar (Pandit-style summary)</h2>
              <div style={cardWhite}>{result?.summary}</div>
            </section>

            {/* SECTIONS */}
            <section style={{marginTop:18}}>
              <h2 style={h2}>Vistar Se Margdarshan</h2>
              <div style={cardsGrid}>
                {Object.entries(result?.sections || {}).map(([title, text]) => (
                  <div key={title} style={cardWhite}>
                    <h3 style={h3}>{title[0].toUpperCase()+title.slice(1)}</h3>
                    <div>{text}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* REMEDIES + LUCKY */}
            <section style={{marginTop:18}}>
              <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:12}}>
                <div style={cardWhite}>
                  <h3 style={h3}>Upaay (Remedies)</h3>
                  <ul style={{margin:"6px 0 0"}}>
                    {(result?.remedies || []).map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
                <div style={cardWhite}>
                  <h3 style={h3}>Lucky Signals</h3>
                  <div>Number: <b>{result?.lucky?.number}</b></div>
                  <div>Color: <b>{result?.lucky?.color}</b></div>
                  <div>Din: <b>{result?.lucky?.day}</b></div>
                </div>
              </div>
            </section>

            {/* TIMELINES + DO/DONTS */}
            <section style={{marginTop:18}}>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
                <div style={cardWhite}>
                  <h3 style={h3}>Agle 30 Din — Focus</h3>
                  <ul style={{margin:"6px 0 0"}}>
                    {(result?.timelines || []).map((t, i) => (
                      <li key={i}><b>{t.window}:</b> {t.focus} — <i>{t.tip}</i></li>
                    ))}
                  </ul>
                </div>
                <div style={cardWhite}>
                  <h3 style={h3}>Do / Don’t</h3>
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
                    <div>
                      <b>Do</b>
                      <ul style={{margin:"6px 0 0"}}>
                        {(result?.dos_donts?.do || []).map((x, i) => <li key={i}>{x}</li>)}
                      </ul>
                    </div>
                    <div>
                      <b>Don’t</b>
                      <ul style={{margin:"6px 0 0"}}>
                        {(result?.dos_donts?.avoid || []).map((x, i) => <li key={i}>{x}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer style={{textAlign:"center", fontSize:12, color:"#888", padding:"24px 0 32px"}}>
        © Pavitra Gyaan — spiritual guidance for daily clarity
      </footer>
    </div>
  );
}

// --- tiny UI helpers ---
const inputStyle = { padding:10, border:"1px solid #d7d7db", borderRadius:10, width:"100%", background:"#fff" };
const primaryBtn = { background:"#111", color:"#fff", padding:"10px 14px", border:"none", borderRadius:10, cursor:"pointer" };
const ghostBtn = { background:"#fff", color:"#111", padding:"10px 14px", border:"1px solid #d7d7db", borderRadius:10, cursor:"pointer" };
const h2 = { margin:"6px 0 10px", fontSize:22 };
const h3 = { margin:"0 0 6px", fontSize:16 };
const cardWhite = { background:"#fff", border:"1px solid #ececf0", borderRadius:12, padding:14 };
const cardsGrid = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 };

function MetaCard({label, value}) {
  return (
    <div style={cardWhite}>
      <div style={{fontSize:12, color:"#666"}}>{label}</div>
      <div style={{fontSize:16}}><b>{value || "—"}</b></div>
    </div>
  );
}
