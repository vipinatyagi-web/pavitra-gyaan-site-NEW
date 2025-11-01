
import { useMemo, useRef, useState } from 'react';

const TABS = ['Overview','Career','Money','Love','Health','Family','Education','Travel','Spiritual','Upaay','Lucky','Do/Don’t','Timeline'];

export default function Home(){
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({full_name:'Vipin',dob:'1993-02-02',tob:'10:00',lat:'29.3909',lon:'76.9635',tz_offset_minutes:'330'});
  const [extra,setExtra]=useState({
    country:'India', birthplace:'Panipat, Haryana',
    gender:'Male', relationship_status:'Single',
    career_stage:'Working Professional', career_goal:'Promotion / Better role',
    money_goal:'Savings & Investments', health_focus:'Sleep & Energy',
    spiritual_inclination:'Bhakti / Devotion', top_concern:'Career Clarity', time_horizon:'Next 90 days'
  });

  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [active,setActive]=useState('Overview');
  const reportRef=useRef(null);

  const [chatOpen,setChatOpen]=useState(false);
  const [messages,setMessages]=useState([{role:'bot',text:'Namaste 🙏 Aap apne sawal yahin pooch sakte hain (career, love, health, money).'}]);
  const [q,setQ]=useState('');

  const istLabel=useMemo(()=>{
    if((extra.country||'').toLowerCase()==='india') return `Local (${extra.birthplace||'India'}) — IST`;
    const m=parseInt(form.tz_offset_minutes||'330',10);
    const s=m>=0?'+':'-'; const h=String(Math.floor(Math.abs(m)/60)).padStart(2,'0'); const mm=String(Math.abs(m)%60).padStart(2,'0');
    return `UTC${s}${h}:${mm}`;
  },[form.tz_offset_minutes, extra.country, extra.birthplace]);

  const update=e=>setForm({...form,[e.target.name]:e.target.value});
  const updateExtra=e=>setExtra({...extra,[e.target.name]:e.target.value});
  const setIST=()=>setForm({...form,tz_offset_minutes:'330'});

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
  const askQuick=(text)=>{ setChatOpen(true); setQ(text); setTimeout(()=>document.querySelector('.chatInput')?.focus(),50); };

  return (
    <div className="container">
      <div className="header">
        <div className="logo">ॐ</div>
        <div>
          <div className="brand">Pavitra Gyaan</div>
          <div className="sub">Seedha-saadha, Indian Hinglish • Clean UX • PDF & Chat</div>
        </div>
      </div>

      {/* MULTI-STEP */}
      <div className="card" style={{marginTop:16}}>
        <div className="stepper">
          <div className={`step ${step===1?'active':''}`} onClick={()=>setStep(1)}><div className="dot">1</div><div>Birth</div></div>
          <div className={`step ${step===2?'active':''}`} onClick={()=>setStep(2)}><div className="dot">2</div><div>Preferences</div></div>
          <div className={`step ${step===3?'active':''}`} onClick={()=>setStep(3)}><div className="dot">3</div><div>Review</div></div>
        </div>

        {step===1 && (
          <div>
            <div className="row">
              <input className="input" name="full_name" value={form.full_name} onChange={update} placeholder="Full Name" />
              <div className="row" style={{gap:12}}>
                <input className="input" type="date" name="dob" value={form.dob} onChange={update}/>
                <input className="input" type="time" name="tob" value={form.tob} onChange={update}/>
              </div>
            </div>
            <div className="row" style={{marginTop:12}}>
              <input className="input" name="lat" value={form.lat} onChange={update} placeholder="Latitude (e.g., 28.6139)" />
              <input className="input" name="lon" value={form.lon} onChange={update} placeholder="Longitude (e.g., 77.2090)" />
            </div>
            <div className="row" style={{marginTop:12}}>
              <input className="input" name="tz_offset_minutes" value={form.tz_offset_minutes} onChange={update} placeholder="TZ offset minutes (IST=330)" />
              <button className="btnGhost" type="button" onClick={setIST}>Set IST</button>
            </div>

            <div className="row" style={{marginTop:12}}>
              <input className="input" name="birthplace" value={extra.birthplace} onChange={e=>updateExtra({target:{name:'birthplace',value:e.target.value}})} placeholder="Birth Place (City, State)" />
              <select className="select" name="country" value={extra.country} onChange={updateExtra}>
                <option>India</option><option>UAE</option><option>USA</option><option>UK</option><option>Canada</option><option>Australia</option><option>Other</option>
              </select>
            </div>

            <div style={{display:'flex',gap:12,marginTop:12}}>
              <button className="btn" onClick={()=>setStep(2)}>Next →</button>
            </div>
            <div className="sub" style={{marginTop:8}}>Time shown as: <b>{istLabel}</b></div>
          </div>
        )}

        {step===2 && (
          <div>
            <div className="row">
              <Select label="Gender" name="gender" value={extra.gender} onChange={updateExtra} options={['Male','Female','Other']}/>
              <Select label="Relationship Status" name="relationship_status" value={extra.relationship_status} onChange={updateExtra} options={['Single','Committed/Married','It’s Complicated']}/>
            </div>
            <div className="row" style={{marginTop:12}}>
              <Select label="Career Stage" name="career_stage" value={extra.career_stage} onChange={updateExtra} options={['Student','Working Professional','Manager/Lead','Entrepreneur','Career Break']}/>
              <Select label="Career Goal" name="career_goal" value={extra.career_goal} onChange={updateExtra} options={['Promotion / Better role','Job change','Start business','Skill upgrade','Work-life balance']}/>
            </div>
            <div className="row" style={{marginTop:12}}>
              <Select label="Money Goal" name="money_goal" value={extra.money_goal} onChange={updateExtra} options={['Savings & Investments','Debt free','Side income','Big purchase']}/>
              <Select label="Health Focus" name="health_focus" value={extra.health_focus} onChange={updateExtra} options={['Sleep & Energy','Weight/Fitness','Stress/Anxiety','Back/Neck']}/>
            </div>
            <div className="row" style={{marginTop:12}}>
              <Select label="Spiritual Inclination" name="spiritual_inclination" value={extra.spiritual_inclination} onChange={updateExtra} options={['Bhakti / Devotion','Dhyaan / Meditation','Seva / Charity','Gyaan / Study']}/>
              <Select label="Top Concern" name="top_concern" value={extra.top_concern} onChange={updateExtra} options={['Career Clarity','Love/Marriage','Money Stability','Health Routine','Family Harmony']}/>
            </div>
            <div className="row" style={{marginTop:12}}>
              <Select label="Time Horizon" name="time_horizon" value={extra.time_horizon} onChange={updateExtra} options={['Next 30 days','Next 90 days','6–12 months','Multi-year']}/>
              <div></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:12}}>
              <button className="btnGhost" onClick={()=>setStep(1)}>← Back</button>
              <button className="btn" onClick={()=>setStep(3)}>Next →</button>
            </div>
          </div>
        )}

        {step===3 && (
          <div>
            <div className="cardSoft">
              <b>Review</b>
              <div className="hr"></div>
              <div className="grid2">
                <Meta label="Naam" value={form.full_name}/>
                <Meta label="DOB" value={form.dob}/>
                <Meta label="TOB" value={form.tob}/>
                <Meta label="Jagah" value={`${extra.birthplace}, ${extra.country}`}/>
                <Meta label="Lat/Lon" value={`${form.lat}, ${form.lon}`}/>
                <Meta label="Focus" value={extra.top_concern}/>
              </div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:12}}>
              <button className="btnGhost" onClick={()=>setStep(2)}>← Back</button>
              <button className="btn" disabled={loading} onClick={submit}>{loading?'Calculating…':'Generate Kundali'}</button>
            </div>
          </div>
        )}
      </div>

      {/* REPORT */}
      {result && (
        <div ref={reportRef} style={{marginTop:16}}>
          <div className="tabs">{TABS.map(t=>(<div key={t} className={`tab ${active===t?'active':''}`} onClick={()=>setActive(t)}>{t}</div>))}</div>

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
              <Accordion title="Saar (Seedhi baat)" open><div>{result.summary}</div></Accordion>
              <div style={{display:'flex',gap:12,marginTop:12}}>
                <button className="btnGold" onClick={downloadPDF}>Download PDF</button>
                <a className="btnGhost" href={`https://wa.me/?text=${encodeURIComponent('Pavitra Gyaan reading: '+(result.summary||''))}`} target="_blank" rel="noreferrer">Share on WhatsApp</a>
              </div>
            </div>
          )}

          {renderSection('Career', result?.sections?.career, ()=>askQuick('Agla mahina career me best dates?'))}
          {renderSection('Money', result?.sections?.money, ()=>askQuick('Paise bachane ka weekly plan banao.'))}
          {renderSection('Love', result?.sections?.love, ()=>askQuick('Heart-to-heart ke liye best time?'))}
          {renderSection('Health', result?.sections?.health, ()=>askQuick('7-din ka simple health routine?'))}
          {renderSection('Family', result?.sections?.family, ()=>askQuick('Family harmony ke 3 steps?'))}
          {renderSection('Education', result?.sections?.education, ()=>askQuick('45-min study schedule bana do.'))}
          {renderSection('Travel', result?.sections?.travel, ()=>askQuick('Next 60 din me chhota trip window?'))}
          {renderSection('Spiritual', result?.sections?.spiritual, ()=>askQuick('Roz ka 10-min bhakti routine?'))}

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
      )}

      {/* CHAT */}
      <div className="chatDock">
        {!chatOpen && <button className="chatBtn" onClick={()=>setChatOpen(true)}>Ask Pandit</button>}
        {chatOpen && (
          <div className="chatPanel">
            <div className="chatHead"><b>Ask Pandit</b><span className="sub" style={{marginLeft:8}}>Seedhi baat • IST</span>
              <button className="btnGhost" onClick={()=>setChatOpen(false)} style={{padding:'6px 10px',marginLeft:'auto'}}>Close</button>
            </div>
            <div className="chatBody">
              {messages.map((m,i)=>(<div key={i} className={`msg ${m.role==='user'?'user':'bot'}`}>{m.text}</div>))}
            </div>
            <div className="chatInputWrap">
              <input className="chatInput" value={q} onChange={e=>setQ(e.target.value)} placeholder="Apna sawal likhein..." />
              <button className="btn" onClick={ask}>Send</button>
            </div>
          </div>
        )}
      </div>

      <div className="footer">© Pavitra Gyaan — Indian Hinglish • Clean UX • PDF & Chat</div>
    </div>
  );
}

function Meta({label,value}){ return (<div className="cardSoft"><div className="metaKey">{label}</div><div className="metaVal">{value||'—'}</div></div>); }
function Select({label,name,value,onChange,options}){ return (<div><div className="metaKey" style={{margin:'0 0 6px'}}>{label}</div><select className="select" name={name} value={value} onChange={onChange}>{options.map(o=><option key={o}>{o}</option>)}</select></div>); }
function Accordion({title,children,open}){ const [isOpen,setOpen]=useState(!!open); return (<div className="acc"><div className="accHead" onClick={()=>setOpen(v=>!v)}><b>{title}</b><span>{isOpen?'−':'+'}</span></div>{isOpen&&<div className="accBody">{children}</div>}</div>); }
function SectionView({title,data,quick}){
  return (<div className="card" style={{marginTop:12}}>
    <h3 className="h3">{title}</h3>
    {typeof data==='string' ? <div>{data}</div> : (<>
      {data?.headline && <div className="badge">{data.headline}</div>}
      {Array.isArray(data?.indicators)&&<div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'8px 0'}}>{data.indicators.map((b,i)=><span key={i} className="badge">{b}</span>)}</div>}
      {data?.forensic && <Accordion title="Seedhi baat (Detail)" open><div>{data.forensic}</div></Accordion>}
      {Array.isArray(data?.pinpoint)&&data.pinpoint.length>0 && <Accordion title="Exact Windows"><ul style={{margin:'6px 0 0'}}>{data.pinpoint.map((p,i)=><li key={i}><b>{p}</b></li>)}</ul></Accordion>}
      {Array.isArray(data?.actions)&&data.actions.length>0 && <Accordion title="Action Plan (Aaj • 7-din • 90-din)" open><ul style={{margin:'6px 0 0'}}>{data.actions.map((p,i)=><li key={i}>{p}</li>)}</ul></Accordion>}
      {data?.confidence && <div style={{marginTop:8}}><span className="badge">Confidence: {data.confidence}</span></div>}
    </>)}
    <div style={{display:'flex',gap:8,marginTop:10}}><button className="btnGhost" onClick={quick}>Ask follow-up</button></div>
  </div>);
}
function renderSection(title,data,quick){ return (data ? <SectionView title={title} data={data} quick={quick}/> : null); }
function CardList({title,items}){ return (<div className="card" style={{marginTop:12}}><h3 className="h3">{title}</h3><ul style={{margin:'6px 0 0'}}>{(items||[]).map((x,i)=><li key={i}>{x}</li>)}</ul></div>); }
