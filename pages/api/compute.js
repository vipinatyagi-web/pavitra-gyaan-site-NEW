
function fmtDateHuman(dob){try{const [y,m,d]=dob.split('-').map(Number);return new Date(Date.UTC(y,m-1,d)).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}catch{return dob}}
function fmtTimeHuman(t){try{const [H,M]=t.split(':').map(Number);const d=new Date();d.setHours(H);d.setMinutes(M||0);return d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}catch{return t}}
function tzLabel(mins,country){ const m=parseInt(mins||0,10); if((country||'').toLowerCase()==='india'||m===330) return 'Local (IST)'; const s=m>=0?'+':'-'; const h=String(Math.floor(Math.abs(m)/60)).padStart(2,'0'); const mm=String(Math.abs(m)%60).padStart(2,'0'); return `UTC${s}${h}:${mm}` }
function seed(str){ let h=2166136261>>>0; for(let i=0;i<str.length;i++) h=Math.imul(h^str.charCodeAt(i),16777619)>>>0; return n=>((h=Math.imul(h,1664525)+1013904223>>>0)%n); }

function reading(p){
  const { full_name='', dob, tob, lat, lon, tz_offset_minutes, extra={} } = p;
  const pick = seed(`${full_name}|${dob}|${tob}|${lat}|${lon}|${Object.values(extra).join('|')}`);
  const tone=['Seedha kaam, seedha result','Calm dimag + teekhi action','Rukavat khatam — momentum','Front-foot pe raho','Seekhne se door khulenge'][pick(5)];
  const para=(a)=>a.join(' ');

  const career={headline:`${extra.career_goal||'Progress'} • ${extra.time_horizon||'Next 90 days'}`,
    indicators:[`Tum ${extra.career_stage||'professional'} ho — routine se growth dikh rahi hai.`,'Documentation se value dikhegi'],
    forensic:'10:00–01:00 baje highest output; Friday/Tuesday networking DM best.', pinpoint:['Mon/Wed/Fri 10:00–11:30 deep-work','Tue/Thu 11:30–13:00 outreach','Daily 5:15 PM status update'],
    actions:['Aaj: 3 kaam likh ke 5 baje bhejo','7 din: ek tool 20-min/day practice','90 din: 2 case-studies ready'], confidence:'High'};
  const money={headline:extra.money_goal||'Paise ka system', indicators:['70-20-10 best','Impulse kharch control'], forensic:'Subscriptions/EMI review; Payday D+1 ko 10% auto transfer.', pinpoint:['Sun 7 PM weekly review','Payday D+1 auto-transfer'], actions:['Aaj 1 subscription cancel','Is hafte spending cap set','3 mahine emergency fund'], confidence:'Medium'};
  const love={headline:`${extra.relationship_status||'Bonding'} — baat-cheet first`, indicators:['Empathy high','Family time se warmth'], forensic:'Sun 6–8 PM / Wed night short walk best.', pinpoint:['Sun 6–8 PM talk','Wed 8:30 PM walk'], actions:['Aaj appreciative message','Is week 20-min no-screen talk','90 din 3 outings'], confidence:'Medium-High'};
  const health={headline:`${extra.health_focus||'Energy'} — sleep+gut`, indicators:['Late-night screens','3–5 PM dip'], forensic:'3 PM 200ml water + 10-min walk; morning sunlight + breathing.', pinpoint:['3 PM water+walk','10:30 PM screens off'], actions:['10-min sunlight','15-min post-lunch walk','10:30 PM cutoff'], confidence:'Medium'};
  const family={headline:'Chhote rituals, badi sukoon', indicators:['Elders blessing','Practical help > advice'], forensic:'Hafte me 1 call, specific update.', actions:['Ek ghar kaam le lo','Joint decisions me summary'], confidence:'Medium'};
  const education={headline:(extra.career_stage==='Student'?'Exam clarity':'Skill-up ROI'), indicators:['45-min focus blocks','Q/A notes'], forensic:'Mock tests weak areas; curated playlist.', actions:['8-week plan','1 certified cohort'], confidence:'Medium'};
  const travel={headline:'Chhota reflective trip', indicators:['Nature reset','Budget control'], forensic:'NE short trip productive.', actions:['60 din me 1 trip plan'], confidence:'Low-Medium'};
  const spiritual={headline:extra.spiritual_inclination||'Bhakti', indicators:['Roz chhota practice','Consistency >>> intensity'], forensic:'Bhakti+discipline → mind stable.', actions:['Gayatri 11x (10 din)','Ravivar ghee diya 11-min'], confidence:'High'};

  const remedies=['Roz 5-min pranayama','Hafte me ek seva','Ravivar Surya ko jal + gratitude'];
  const timelines=[{window:'Agale 7 din',focus:'2 chhote kaam close',tip:'2×45-min blocks'},{window:'Agale 30 din',focus:'Systems + habit',tip:'Sun 7 PM review'},{window:'Agale 90 din',focus:'Money discipline',tip:'SIP + emergency fund'}];
  const dos_donts={do:['Subah routine fix','Weekly goals visible','Shukriya pehle'],avoid:['Late-night scroll','Impulse spend','Silent treatment']};

  return {
    meta:{ full_name, dob_human: fmtDateHuman(dob), tob_human: fmtTimeHuman(tob), tz_label: tzLabel(tz_offset_minutes, extra.country||'India'), lat, lon, country: extra.country||'India', birthplace: extra.birthplace||'' },
    summary:`Focus: ${extra.top_concern||'Clarity'}. Aaj ka overall tone: ${tone}. Seedhi baat: jo likha hai wohi follow karo.`,
    sections:{ career, money, love, health, family, education, travel, spiritual },
    remedies, timelines, dos_donts,
    lucky:{ number:(pick(90)+10), color:['Kesariya','Emerald','Royal Blue','Maroon','White'][pick(5)], day:['Somvaar','Mangalvaar','Budhvaar','Guruvar','Shukravaar','Shanivaar','Ravivaar'][pick(7)] }
  };
}

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const { full_name, dob, tob, lat, lon, tz_offset_minutes, extra } = req.body || {};
  if(!dob||!tob||!lat||!lon)return res.status(400).json({error:'Missing fields: dob, tob, lat, lon required'});
  try{ const out=reading({ full_name, dob, tob, lat, lon, tz_offset_minutes, extra }); return res.status(200).json(out); }
  catch(e){ return res.status(500).json({error:e.message||'Unknown error'}); }
}
