import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    full_name: "Test User",
    dob: "1997-06-02",
    tob: "10:00",
    lat: "29.58",
    lon: "80.22",
    tz_offset_minutes: "330"
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/compute", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form)
      });
      const j = await res.json();
      if(!res.ok) throw new Error(j?.error || "Server error");
      setResult(j);
    } catch(err) {
      alert("Error: " + err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{fontFamily:"system-ui, Arial", padding:20, maxWidth:900, margin:"auto"}}>
      <h1>🕉️ Pavitra Gyaan — Kundali & Horoscope</h1>
      <form onSubmit={submit} style={{background:"#f7f7f7", padding:14, borderRadius:8}}>
        <input name="full_name" value={form.full_name} onChange={update} style={{width:"100%", padding:8}} />
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:8}}>
          <input name="dob" type="date" value={form.dob} onChange={update} style={{padding:8}} />
          <input name="tob" type="time" value={form.tob} onChange={update} style={{padding:8}} />
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:8}}>
          <input name="lat" value={form.lat} onChange={update} placeholder="Latitude" style={{padding:8}} />
          <input name="lon" value={form.lon} onChange={update} placeholder="Longitude" style={{padding:8}} />
        </div>
        <div style={{display:"flex", gap:8, marginTop:8}}>
          <input name="tz_offset_minutes" value={form.tz_offset_minutes} onChange={update} placeholder="TZ offset (min)" style={{padding:8}} />
          <button disabled={loading} style={{padding:"8px 12px"}}>{loading ? "Please wait..." : "Generate"}</button>
        </div>
      </form>

      {result && (
        <div style={{marginTop:14}}>
          <h3>Raw Response</h3>
          <pre style={{whiteSpace:"pre-wrap", background:"#fff", padding:12, borderRadius:8}}>{JSON.stringify(result, null, 2)}</pre>
          <h3>Horoscope (GPT)</h3>
          <div style={{background:"#fff", padding:12, borderRadius:8}}>{result.horoscope}</div>
        </div>
      )}
    </div>
  );
}
