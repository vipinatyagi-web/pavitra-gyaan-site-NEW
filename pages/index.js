import { useMemo, useRef, useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    full_name: "Vipin",
    dob: "1993-02-02",   // YYYY-MM-DD
    tob: "10:00",        // 24h
    lat: "29.3909",
    lon: "76.9635",
    tz_offset_minutes: "330" // IST default
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const reportRef = useRef(null);

  const istLabel = useMemo(() => {
    const m = parseInt(form.tz_offset_minutes || "330", 10);
    if (m === 330) return "IST (UTC+05:30)";
    const sign = m >= 0 ? "+" : "-";
    const h = String(Math.floor(Math.abs(m)/60)).padStart(2,"0");
    const mm = String(Math.abs(m)%60).padStart(2,"0");
    return `UTC${sign}${h}:${mm}`;
  }, [form.tz_offset_minutes]);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const setIST = () => setForm({ ...form, tz_offset_minutes: "330" });

  async function submit(e){
    e.preventDefault(); setLoading(true); setResult(null);
    try{
      const r = await fetch("/api/compute", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form)
      });
      const j = await r.json();
      if(!r.ok) throw new Error(j?.error || "Server error");
      setResult(j);
      // scroll to report
      setTimeout(()=> reportRef.current?.scrollIntoView({behavior:"smooth"}), 120);
    }catch(err){
      alert("Error: " + err.message);
    }finally{ setLoading(false); }
  }

  async function downloadPDF(){
    try{
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const node = reportRef.current;
      const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#0f111a" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const ratio = pageWidth / canvas.width;
      const imgHeight = canvas.height * ratio;
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
      pdf.save(`PavitraGyaan_Kundali_${(form.full_name||"User").replace(/\s+/g,'_')}.pdf`);
    }catch(e){ alert("PDF error: "+e.message); }
  }

  return (
    <div className="container">
      {/* HERO */}
      <div className="hero">
        <div className="badge">🕉️</div>
        <div>
          <div className="brand">Pavitra Gyaan</div>
          <div className="sub">Kundali & Horoscope — Indian users ke liye IST-friendly, pandit-style guidance</div>
        </div>
      </div>

      {/* FORM */}
      <div className="card" style={{marginTop:16}}>
        <form onSubmit={submit}>
          <div className="row">
            <input className="input" name="full_name" value={form.full_name} onChange={update} placeholder="Full Name" />
            <div className="row" style={{gap:12}}>
              <input className="input" type="date" name="dob" value={form.dob} onChange={update}/>
              <input className="input" type="time" name="tob" value={form.tob} onChange={update}/>
            </div>
          </div>

          <div className="row" style={{marginTop:12}}>
            <input className="input" name="lat" value={form.lat} onChange={update} placeholder="Latitude" />
            <input className="input" name="lon" value={form.lon} onChange={update} placeholder="Longitude" />
          </div>

          <div className="row" style={{marginTop:12}}>
            <input className="input" name="tz_offset_minutes" value={form.tz_offset_minutes} onChange={update} placeholder="TZ offset minutes (IST = 330)" />
            <button type="button" onClick={setIST} className="btnGhost">Set IST</button>
          </div>

          <div className="sub" style={{marginTop:8}}>Time zone: <b>{istLabel}</b></div>

          <div style={{display:"flex", gap:12, marginTop:12}}>
            <button className="btn" disabled={loading}>{loading ? "Calculating…" : "Generate Kundali"}</button>
          </div>
        </form>
      </div>

      {/* REPORT */}
      {result && (
        <div ref={reportRef} style={{marginTop:16}}>
          {/* Meta */}
          <h2 className="h2">Janma Vivaran</h2>
          <div className="grid2">
            <Meta label="Naam" value={result?.meta?.full_name}/>
            <Meta label="Janma Tithi" value={result?.meta?.dob_human}/>
            <Meta label="Janma Samay" value={`${result?.meta?.tob_human}  •  ${result?.meta?.tz_label}`}/>
            <Meta label="Sthal" value={`${result?.meta?.lat}, ${result?.meta?.lon}`}/>
          </div>

          <div className="hr"></div>

          {/* Summary big card */}
          <div className="cardWhite">
            <h3 className="h3">Saar</h3>
            <div>{result.summary}</div>
          </div>

          {/* Sections grid */}
          <h2 className="h2" style={{marginTop:18}}>Vistar se Margdarshan</h2>
          <div className="grid2">
            {Object.entries(result.sections).map(([k,v]) => (
              <div key={k} className="cardWhite">
                <h3 className="h3">{titleCase(k)}</h3>
                <div>{v}</div>
              </div>
            ))}
          </div>

          {/* Remedies + Lucky */}
          <div className="grid2" style={{marginTop:18}}>
            <div className="cardWhite">
              <h3 className="h3">Upaay</h3>
              <ul style={{margin:"6px 0 0"}}>
                {(result.remedies||[]).map((r,i)=><li key={i}>{r}</li>)}
              </ul>
            </div>
            <div className="cardWhite">
              <h3 className="h3">Lucky Signals</h3>
              <div>Number: <b>{result?.lucky?.number}</b></div>
              <div>Color: <b>{result?.lucky?.color}</b></div>
              <div>Din: <b>{result?.lucky?.day}</b></div>
            </div>
          </div>

          {/* Timeline + Dos/Don'ts */}
          <div className="grid2" style={{marginTop:18}}>
            <div className="cardWhite">
              <h3 className="h3">Agle 30 Din — Focus</h3>
              <ul style={{margin:"6px 0 0"}}>
                {(result.timelines||[]).map((t,i)=>(
                  <li key={i}><b>{t.window}:</b> {t.focus} — <i>{t.tip}</i></li>
                ))}
              </ul>
            </div>
            <div className="cardWhite">
              <h3 className="h3">Do / Don’t</h3>
              <div className="row" style={{gap:12}}>
                <div>
                  <b>Do</b>
                  <ul style={{margin:"6px 0 0"}}>{(result.dos_donts?.do||[]).map((x,i)=><li key={i}>{x}</li>)}</ul>
                </div>
                <div>
                  <b>Don’t</b>
                  <ul style={{margin:"6px 0 0"}}>{(result.dos_donts?.avoid||[]).map((x,i)=><li key={i}>{x}</li>)}</ul>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{display:"flex", gap:12, marginTop:16}}>
            <button className="btn" onClick={downloadPDF}>Download PDF</button>
            <a className="btnGhost" href={`https://wa.me/?text=${encodeURIComponent(
              `Pavitra Gyaan – ${form.full_name} ki kundali ka saar:\n` +
              (result.summary||"") + `\nRead: ${typeof window!=='undefined'?window.location.href:''}`
            )}`} target="_blank" rel="noreferrer">Share on WhatsApp</a>
          </div>
        </div>
      )}

      <div className="footer">© Pavitra Gyaan • Designed for Indian users • IST-friendly</div>
    </div>
  );
}

function Meta({label, value}) {
  return (
    <div className="cardWhite">
      <div className="metaKey">{label}</div>
      <div className="metaVal">{value || "—"}</div>
    </div>
  );
}
function titleCase(s){ return s.slice(0,1).toUpperCase()+s.slice(1); }
