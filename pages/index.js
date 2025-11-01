
import { useMemo, useRef, useState } from 'react';

const TABS = ['Overview','Career','Money','Love','Health','Family','Education','Travel','Spiritual','Upaay','Lucky','Do/Don’t','Timeline'];

export default function Home(){
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({full_name:'Vipin',dob:'1993-02-02',tob:'10:00',lat:'29.3909',lon:'76.9635',tz_offset_minutes:'330'});
  const [extra,setExtra]=useState({country:'India', birthplace:'Panipat, Haryana', gender:'Male', relationship_status:'Single', career_stage:'Working Professional', career_goal:'Promotion / Better role', money_goal:'Savings & Investments', health_focus:'Sleep & Energy', spiritual_inclination:'Bhakti / Devotion', top_concern:'Career Clarity', time_horizon:'Next 90 days'});
  const [place,setPlace]=useState('Panipat, Haryana');
  const [geoLoading,setGeoLoading]=useState(false);

  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [active,setActive]=useState('Overview');
  const reportRef=useRef(null);

  const [chatOpen,setChatOpen]=useState(false);
  const [messages,setMessages]=useState([{role:'bot',text:'Namaste 🙏 Aap apne sawal yahin pooch sakte hain (career, love, health, money).'}]);
  const [q,setQ]=useState('');

  const istLabel=useMemo(()=>{
    const m=parseInt(form.tz_offset_minutes||'330',10);
    if((extra.country||'').toLowerCase()==='india' || m===330) return `Local (${extra.birthplace||'India'}) — IST`;
    const s=m>=0?'+':'-'; const h=String(Math.floor(Math.abs(m)/60)).padStart(2,'0'); const mm=String(Math.abs(m)%60).padStart(2,'0');
    return `UTC${s}${h}:${mm}`;
  },[form.tz_offset_minutes, extra.country, extra.birthplace]);

  const update=e=>setForm({...form,[e.target.name]:e.target.value});
  const updateExtra=e=>setExtra({...extra,[e.target.name]:e.target.value});

  async function resolvePlace(){
    if(!place.trim())return;
    setGeoLoading(true);
    try{
      const r=await fetch(`/api/geo?query=${encodeURIComponent(place)}`);
      const j=await r.json();
      if(!r.ok) throw new Error(j?.error||'Location not found');
      setForm({...form, lat:String(j.lat), lon:String(j.lon), tz_offset_minutes:String(j.tz_offset_minutes)});
      setExtra({...extra, birthplace: j.address || place, country: j.country || extra.country});
    }catch(e){ alert('Geo error: '+e.message); }
    finally{ setGeoLoading(false); }
  }
  async function detectMe(){
    if(!navigator.geolocation){ alert('Location permission not available'); return; }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos)=>{
      try{
        const { latitude, longitude } = pos.coords;
        const r=await fetch(`/api/geo?lat=${latitude}&lon=${longitude}`);
        const j=await r.json();
        if(!r.ok) throw new Error(j?.error||'Geo failed');
        setForm({...form, lat:String(j.lat), lon:String(j.lon), tz_offset_minutes:String(j.tz_offset_minutes)});
        setExtra({...extra, birthplace: j.address || extra.birthplace, country: j.country || extra.country});
        setPlace(j.address || `${latitude}, ${longitude}`);
      }catch(e){ alert('Detect error: '+e.message); } finally{ setGeoLoading(false); }
    }, (err)=>{ setGeoLoading(false); alert('Permission denied'); });
  }

  async function submit(e){
    e?.preventDefault?.(); setLoading(true); setResult(null);
    try{
      const r=await fetch('/api/compute',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form, extra})});
      const j=await r.json(); if(!r.ok) throw new Error(j?.error||'Server error');
      setResult(j); setActive('Overview'); setTimeout(()=>reportRef.current?.scrollIntoView({behavior:'smooth'}),120);
    }catch(err){ alert('Error: '+err.message);}finally{ setLoading(false); }
  }

  async function ask(){
    if(!q.trim())return;
    const mine=[...messages,{role:'user',text:q}]; setMessages(mine); setQ('');
    try{ const r=await fetch('/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,context:result})});
      const j=await r.json(); setMessages([...mine,{role:'bot',text:j?.reply||'—'}]);
    }catch{ setMessages([...mine,{role:'bot',text:'Network error — baad me poochein.'}]); }
  }

  async function downloadPDF(){
    const html2canvas=(await import('html2canvas')).default; const {jsPDF}=await import('jspdf');
    const node=reportRef.current; const canvas=await html2canvas(node,{scale:2,backgroundColor:'#0e1220'});
    const img=canvas.toDataURL('image/png'); const pdf=new jsPDF({orientation:'p',unit:'pt',format:'a4'});
    const w=pdf.internal.pageSize.getWidth(); const ratio=w/canvas.width; const h=canvas.height*ratio;
    pdf.addImage(img,'PNG',0,0,w,h); pdf.save(`PavitraGyaan_${(form.full_name||'User').replace(/\s+/g,'_')}.pdf`);
  }

  return (
    <div className="container">
      <div className="header">
        <div className="logo">ॐ</div>
        <div><div className="brand">Pavitra Gyaan</div><div className="sub">Indian Hinglish • Clean UX • Google Geo + Timezone</div></div>
      </div>

      <div className="card" style={{marginTop:16}}>
        <div className="row">
          <input className="input" name="full_name" value={form.full_name} onChange={update} placeholder="Full Name" />
          <div className="row" style={{gap:12}}>
            <input className="input" type="date" name="dob" value={form.dob} onChange={update}/>
            <input className="input" type="time" name="tob" value={form.tob} onChange={update}/>
          </div>
        </div>

        {/* Place search + detect */}
        <div className="row" style={{marginTop:12}}>
          <input className="input" value={place} onChange={e=>setPlace(e.target.value)} placeholder="Birthplace (City, State) e.g., Panipat, Haryana" />
          <div style={{display:'flex',gap:8}}>
            <button className="btn" type="button" disabled={geoLoading} onClick={resolvePlace}>{geoLoading?'Finding…':'Find Place'}</button>
            <button className="btnGhost" type="button" disabled={geoLoading} onClick={detectMe}>Use my location</button>
          </div>
        </div>

        <div className="row" style={{marginTop:12}}>
          <input className="input" name="lat" value={form.lat} onChange={update} placeholder="Latitude" />
          <input className="input" name="lon" value={form.lon} onChange={update} placeholder="Longitude" />
        </div>

        <div className="row" style={{marginTop:12}}>
          <input className="input" name="tz_offset_minutes" value={form.tz_offset_minutes} onChange={update} placeholder="TZ offset minutes (IST=330)" />
          <select className="select" name="country" value={extra.country} onChange={e=>setExtra({...extra,country:e.target.value})}>
            <option>India</option><option>UAE</option><option>USA</option><option>UK</option><option>Canada</option><option>Australia</option><option>Other</option>
          </select>
        </div>

        <div className="row" style={{marginTop:12}}>
          <select className="select" name="relationship_status" value={extra.relationship_status} onChange={e=>setExtra({...extra,relationship_status:e.target.value})}>
            <option>Single</option><option>Committed/Married</option><option>It’s Complicated</option>
          </select>
          <select className="select" name="career_stage" value={extra.career_stage} onChange={e=>setExtra({...extra,career_stage:e.target.value})}>
            <option>Student</option><option>Working Professional</option><option>Manager/Lead</option><option>Entrepreneur</option><option>Career Break</option>
          </select>
        </div>

        <div className="row" style={{marginTop:12}}>
          <select className="select" name="career_goal" value={extra.career_goal} onChange={e=>setExtra({...extra,career_goal:e.target.value})}>
            <option>Promotion / Better role</option><option>Job change</option><option>Start business</option><option>Skill upgrade</option><option>Work-life balance</option>
          </select>
          <select className="select" name="money_goal" value={extra.money_goal} onChange={e=>setExtra({...extra,money_goal:e.target.value})}>
            <option>Savings & Investments</option><option>Debt free</option><option>Side income</option><option>Big purchase</option>
          </select>
        </div>

        <div className="row" style={{marginTop:12}}>
          <select className="select" name="health_focus" value={extra.health_focus} onChange={e=>setExtra({...extra,health_focus:e.target.value})}>
            <option>Sleep & Energy</option><option>Weight/Fitness</option><option>Stress/Anxiety</option><option>Back/Neck</option>
          </select>
          <select className="select" name="spiritual_inclination" value={extra.spiritual_inclination} onChange={e=>setExtra({...extra,spiritual_inclination:e.target.value})}>
            <option>Bhakti / Devotion</option><option>Dhyaan / Meditation</option><option>Seva / Charity</option><option>Gyaan / Study</option>
          </select>
        </div>

        <div className="row" style={{marginTop:12}}>
          <select className="select" name="time_horizon" value={extra.time_horizon} onChange={e=>setExtra({...extra,time_horizon:e.target.value})}>
            <option>Next 30 days</option><option>Next 90 days</option><option>6–12 months</option><option>Multi-year</option>
          </select>
          <input className="input" name="birthplace" value={extra.birthplace} onChange={e=>setExtra({...extra,birthplace:e.target.value})} placeholder="Final Birthplace label to show" />
        </div>

        <div style={{display:'flex',gap:12,marginTop:12}}>
          <button className="btn" disabled={loading} onClick={submit}>{loading?'Calculating…':'Generate Kundali'}</button>
        </div>

        <div className="sub" style={{marginTop:8}}>Time shown as: <b>{istLabel}</b></div>
      </div>

      {/* REPORT */}
      {result && (
        <Report result={result} active={active} setActive={setActive} reportRef={reportRef} downloadPDF={downloadPDF} />
      )}

      {/* CHAT */}
      <div className="chatDock">
        {!chatOpen && <button className="chatBtn" onClick={()=>setChatOpen(true)}>Ask Pandit</button>}
        {chatOpen && (
          <div className="chatPanel">
            <div className="chatHead"><b>Ask Pandit</b><span className="sub" style={{marginLeft:8}}>Seedhi baat • IST</span>
              <button className="btnGhost" onClick={()=>setChatOpen(false)} style={{padding:'6px 10px',marginLeft:'auto'}}>Close</button>
            </div>
            <div className="chatBody">{messages.map((m,i)=>(<div key={i} className={`msg ${m.role==='user'?'user':'bot'}`}>{m.text}</div>))}</div>
            <div className="chatInputWrap">
              <input className="chatInput" value={q} onChange={e=>setQ(e.target.value)} placeholder="Apna sawal likhein..." />
              <button className="btn" onClick={ask}>Send</button>
            </div>
          </div>
        )}
      </div>

      <div className="footer">© Pavitra Gyaan — Google Geo + Timezone • Indian Hinglish • PDF & Chat</div>
    </div>
  );
}

function Report({result, active, setActive, reportRef, downloadPDF}){
  return (
    <div ref={reportRef} style={{marginTop:16}}>
      <div className="tabs">{['Overview','Career','Money','Love','Health','Family','Education','Travel','Spiritual','Upaay','Lucky','Do/Don’t','Timeline'].map(t=>(<div key={t} className={`tab ${active===t?'active':''}`} onClick={()=>setActive(t)}>{t}</div>))}</div>
      {active==='Overview' && (
        <div className="card" style={{marginTop:12}}>
          <div className="grid2">
            <Meta label="Naam" value={result?.meta?.full_name}/>
            <Meta label="Janma Tithi" value={result?.meta?.dob_human}/>
            <Meta label="Janma Samay (Local)" value={`${result?.meta?.tob_human} • ${result?.meta?.tz_label}`}/>
            <Meta label="Sthal" value={`${result?.meta?.birthplace||'-'}, ${result?.meta?.country||'-'}`}/>
            <Meta label="Lat/Lon" value={`${result?.meta?.lat}, ${result?.meta?.lon}`}/>
          </div>
          <div className="hr"></div>
          <Acc title="Saar (Seedhi baat)" open><div>{result.summary}</div></Acc>
          <div style={{display:'flex',gap:12,marginTop:12}}>
            <button className="btn" onClick={downloadPDF}>Download PDF</button>
          </div>
        </div>
      )}
      {renderSection('Career', result?.sections?.career)}
      {renderSection('Money', result?.sections?.money)}
      {renderSection('Love', result?.sections?.love)}
      {renderSection('Health', result?.sections?.health)}
      {renderSection('Family', result?.sections?.family)}
      {renderSection('Education', result?.sections?.education)}
      {renderSection('Travel', result?.sections?.travel)}
      {renderSection('Spiritual', result?.sections?.spiritual)}
      {active==='Upaay' && <CardList title="Upaay" items={result?.remedies||[]}/>}
      {active==='Lucky' && (
        <div className="card" style={{marginTop:12}}>
          <h3 className="h3">Lucky Signals</h3>
          <div>Number: <b>{result?.lucky?.number}</b></div>
          <div>Color: <b>{result?.lucky?.color}</b></div>
          <div>Din: <b>{result?.lucky?.day}</b></div>
        </div>
      )}
      {active==='Do/Don’t' && (
        <div className="card" style={{marginTop:12}}>
          <h3 className="h3">Do / Don’t</h3>
          <div className="row" style={{gap:12}}>
            <div className="cardSoft"><b>Do</b><ul style={{margin:'6px 0 0'}}>{(result.dos_donts?.do||[]).map((x,i)=><li key={i}>{x}</li>)}</ul></div>
            <div className="cardSoft"><b>Don’t</b><ul style={{margin:'6px 0 0'}}>{(result.dos_donts?.avoid||[]).map((x,i)=><li key={i}>{x}</li>)}</ul></div>
          </div>
        </div>
      )}
      {active==='Timeline' && (
        <div className="card" style={{marginTop:12}}>
          <h3 className="h3">Agle 30–90 Din</h3>
          <ul style={{margin:'6px 0 0'}}>{(result.timelines||[]).map((t,i)=>(<li key={i}><b>{t.window}:</b> {t.focus} — <i>{t.tip}</i></li>))}</ul>
        </div>
      )}
    </div>
  );
}

function renderSection(title, data){
  if(!data) return null;
  return (
    <div className="card" style={{marginTop:12}}>
      <h3 className="h3">{title}</h3>
      {typeof data==='string'? <div>{data}</div> : (
        <>
          {data?.headline && <div className="badge">{data.headline}</div>}
          {Array.isArray(data?.indicators)&&data.indicators.length>0 && (<div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'8px 0'}}>{data.indicators.map((b,i)=><span key={i} className="badge">{b}</span>)}</div>)}
          {data?.forensic && <Acc title="Seedhi baat (Detail)" open><div>{data.forensic}</div></Acc>}
          {Array.isArray(data?.pinpoint)&&data.pinpoint.length>0 && (<Acc title="Exact Windows"><ul style={{margin:'6px 0 0'}}>{data.pinpoint.map((p,i)=><li key={i}><b>{p}</b></li>)}</ul></Acc>)}
          {Array.isArray(data?.actions)&&data.actions.length>0 && (<Acc title="Action Plan (Aaj • 7-din • 90-din)" open><ul style={{margin:'6px 0 0'}}>{data.actions.map((p,i)=><li key={i}>{p}</li>)}</ul></Acc>)}
          {data?.confidence && <div style={{marginTop:8}}><span className="badge">Confidence: {data.confidence}</span></div>}
        </>
      )}
    </div>
  );
}

function Meta({label,value}){ return (<div className="cardSoft"><div className="metaKey">{label}</div><div className="metaVal">{value||'—'}</div></div>); }
function Acc({title,children,open}){ const [isOpen,setOpen]=useState(!!open); return (<div className="acc"><div className="accHead" onClick={()=>setOpen(v=>!v)}><b>{title}</b><span>{isOpen?'−':'+'}</span></div>{isOpen&&<div className="accBody">{children}</div>}</div>); }
