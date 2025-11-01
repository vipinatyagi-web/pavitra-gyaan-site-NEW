
import fetch from 'node-fetch';
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const { question, context } = req.body || {};
  if(!question) return res.status(400).json({error:'Missing "question"'});
  const key = process.env.OPENAI_API_KEY;
  if(!key){
    // very simple rule reply
    const q=(question||'').toLowerCase();
    const pick = (k)=> context?.sections?.[k];
    if(q.includes('career')) return res.status(200).json({reply: (pick('career')?.forensic||'Career: daily deep-work 10–11:30, Friday networking DM.')});
    if(q.includes('money')) return res.status(200).json({reply: (pick('money')?.forensic||'Money: 70-20-10, D+1 auto 10% transfer.')});
    if(q.includes('love')) return res.status(200).json({reply: (pick('love')?.forensic||'Love: Sun 6–8 PM heart-to-heart, Wed walk.')});
    if(q.includes('health')) return res.status(200).json({reply: (pick('health')?.forensic||'Health: 3 PM water+walk, 10:30 PM screen off.')});
    return res.status(200).json({reply:'Specific sawal poochho: career / love / health / money.'});
  }
  try{
    const r=await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
      body: JSON.stringify({
        model:'gpt-4o-mini',
        messages:[{role:'system',content:'Hinglish me short, seedha, practical jawab do.'},
                  {role:'user',content:`Question: ${question}
Context: ${JSON.stringify(context||{})}
3 chhoti lines max.`}],
        max_tokens:220,temperature:0.5
      })
    });
    const j=await r.json();
    const text=j?.choices?.[0]?.message?.content||'—';
    return res.status(200).json({reply:text});
  }catch(e){ return res.status(200).json({reply:'Network issue — thodi der baad poochein.'}); }
}
