
import fetch from "node-fetch";

function fmtDateHuman(dob){try{const [y,m,d]=dob.split('-').map(Number);return new Date(Date.UTC(y,m-1,d)).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}catch{return dob}}
function fmtTimeHuman(t){try{const [H,M]=t.split(':').map(Number);const d=new Date();d.setHours(H);d.setMinutes(M||0);return d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}catch{return t}}
function tzLabel(mins,country){ if((country||'').toLowerCase()==='india') return 'Local (India) — IST'; const m=parseInt(mins||0,10); if(m===330) return 'IST (UTC+05:30)'; const s=m>=0?'+':'-'; const h=String(Math.floor(Math.abs(m)/60)).padStart(2,'0'); const mm=String(Math.abs(m)%60).padStart(2,'0'); return `UTC${s}${h}:${mm}` }

function seed(str){ let h=2166136261>>>0; for(let i=0;i<str.length;i++) h=Math.imul(h^str.charCodeAt(i),16777619)>>>0; return n=>((h=Math.imul(h,1664525)+1013904223>>>0)%n); }

function fallbackDetailed(p){
  const { full_name='', dob, tob, lat, lon, tz_offset_minutes, extra={} } = p;
  const pick = seed(`${full_name}|${dob}|${tob}|${lat}|${lon}|${Object.values(extra).join('|')}`);
  const tone=['seedha kaam, seedha result','calm dimag + teekhi action','rukavat khatam — momentum aayega','front-foot par rehna sahi','seekhne se door khulenge'][pick(5)];

  const career={
    headline:`${extra.career_goal||'Progress'} • ${extra.time_horizon||'Next 90 days'}`,
    indicators:[
      `Tum ${extra.career_stage||'professional'} ho — routine banate hi growth dikhegi.`,
      'Document ki habit se boss/client ko tumhari value dikhegi.'
    ],
    forensic: 'Din me 10:00–01:00 baje tumhaari sabse tez soch chalti hai. Is time me deep-work rakho. Friday ya Tuesday ko 30-min networking DM se opportunities milti hain.',
    pinpoint:['Deep-work: Mon/Wed/Fri 10:00–11:30','Interview outreach: Tue/Thu 11:30–13:00','Status update: daily 5:15 PM, short & clear'],
    actions:['Aaj: 3 kaam likh ke 5 baje tak bhej do.','7 din: ek tool (Excel/SQL/AI) 20-min/day — 2 output proof banao.','90 din: 2 case-studies tayyar rakho appraisal ya HR call ke liye.'],
    confidence:'High'
  };
  const money={
    headline:extra.money_goal||'Paise ka system',
    indicators:['70-20-10 rule tumhare liye best','Impulse kharch bandh karna padega'],
    forensic:'Subscriptions/EMI check karo. Salary aate hi D+1 ko 10% alag account me auto transfer.',
    pinpoint:['Sunday 7 PM — weekly kharcha review','Payday D+1 — auto transfer 10%'],
    actions:['Aaj hi subscription list banao — 1 cancel.','Is hafte discretionary cap set karo (₹).','3 mahine me emergency fund 1x monthly expense.'],
    confidence:'Medium'
  };
  const love={
    headline:`${extra.relationship_status||'Bonding'} — baat-cheet pe focus`,
    indicators:['Empathy high, lekin seedha kehna mushkil','Family time se warmth aati hai'],
    forensic:'Heart-to-heart ke liye Sun 6–8 PM ya Wed raat chhota walk best rahta hai.',
    pinpoint:['Sun 6–8 PM — deep talk','Wed 8:30 PM — short walk'],
    actions:['Aaj: ek appreciative message (specific).','Is week: 20-min no-screen baat, agenda pehle likh lo.','90 din: 3 outings jisme phone side me.'],
    confidence:'Medium-High'
  };
  const health={
    headline:`${extra.health_focus||'Energy'} — neend + gut`,
    indicators:['Late-night screen → neend down','3–5 PM energy dip aata hai'],
    forensic:'3 PM exact par 200ml paani + 10-min walk. Morning me 10-min sunlight + 5-min breathing.',
    pinpoint:['3:00 PM — water + walk','10:30 PM — screen off routine'],
    actions:['Roz subah 10-min sunlight','Lunch ke baad 15-min halki walk','Raat 10:30 ke baad phone band'],
    confidence:'Medium'
  };
  const family={headline:'Chhote rituals, badi sukoon', indicators:['Elders blessing uplift','Advice se zyada practical help'], forensic:'Hafte me 1 call, specific update ke saath.', actions:['Ek ghar kaam tum le lo','Joint decisions me calmly summary bolo'], confidence:'Medium'};
  const education={headline:(extra.career_stage==='Student'?'Exam clarity':'Skill-up high ROI'), indicators:['45-min deep focus blocks','Notes → Q/A cards'], forensic:'Mock test se weak area identify, playlist curated rakho.', actions:['8-week plan banao','Ek certified cohort join karo'], confidence:'Medium'};
  const travel={headline:'Chhota reflective trip', indicators:['Nature/temple reset','Budget control pehle'], forensic:'NE short trip productive.', actions:['60 din me 1 trip plan karo'], confidence:'Low-Medium'};
  const spiritual={headline:extra.spiritual_inclination||'Bhakti', indicators:['Roz ka chhota practice','Consistency >>> intensity'], forensic:'Bhakti + discipline → mind stable.', actions:['Gayatri 11x subah (10 din)','Ravivar ghee diya 11-min'], confidence:'High'};

  const remedies=['Roz 5-min pranayama sone se pehle','Hafte me ek seva/charity','Ravivar Surya ko jal + gratitude list'];
  const timelines=[{window:'Agale 7 din',focus:'2 chhote kaam close',tip:'2×45-min blocks'},{window:'Agale 30 din',focus:'Systems + habit',tip:'Sunday 7 PM review'},{window:'Agale 90 din',focus:'Money discipline',tip:'SIP + emergency fund'}];
  const dos_donts={do:['Subah routine fix','Weekly goals visible','Shukriya pehle'],avoid:['Late-night scroll','Impulse spend','Silent treatment']};

  return {
    meta:{ full_name, dob_human: fmtDateHuman(dob), tob_human: fmtTimeHuman(tob), tz_label: tzLabel(tz_offset_minutes, extra.country||'India'), lat, lon, country: extra.country||'India', birthplace: extra.birthplace||'' },
    summary:`Focus: ${extra.top_concern||'Clarity'}. Aaj ka overall tone: ${tone}. Seedhi baat, seedha action: jo likha hai wohi karo, results dikhenge.`,
    sections:{ career, money, love, health, family, education, travel, spiritual },
    remedies, timelines, dos_donts,
    lucky:{ number:(pick(90)+10), color:['Kesariya','Emerald','Royal Blue','Maroon','White'][pick(5)], day:['Somvaar','Mangalvaar','Budhvaar','Guruvar','Shukravaar','Shanivaar','Ravivaar'][pick(7)] },
    note:'Deterministic rule-engine (no planet math). City-wise local label dikhaya. Exact planetary precision add karna ho to Swiss Ephemeris backend integrate hoga.'
  };
}

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const { full_name, dob, tob, lat, lon, tz_offset_minutes, extra } = req.body || {};
  if(!dob||!tob||!lat||!lon)return res.status(400).json({error:'Missing fields: dob, tob, lat, lon required'});
  try{ const out=fallbackDetailed({ full_name, dob, tob, lat, lon, tz_offset_minutes, extra }); return res.status(200).json(out); }
  catch(e){ return res.status(500).json({error:e.message||'Unknown error'}); }
}
