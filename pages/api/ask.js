
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const { question, context } = req.body || {};
  if(!question) return res.status(400).json({error:'Missing "question"'});
  const q=(question||'').toLowerCase();
  const pick=k=>context?.sections?.[k];
  if(q.includes('career')) return res.status(200).json({reply: pick('career')?.forensic || 'Career: Mon/Wed/Fri 10–11:30 deep-work; Tue/Thu outreach.'});
  if(q.includes('money')) return res.status(200).json({reply: pick('money')?.forensic || 'Money: 70-20-10, subscriptions review, D+1 auto 10%.'});
  if(q.includes('love')) return res.status(200).json({reply: pick('love')?.forensic || 'Love: Sun 6–8 PM talk; Wed walk.'});
  if(q.includes('health')) return res.status(200).json({reply: pick('health')?.forensic || 'Health: 3 PM water+walk; 10:30 PM screen-off.'});
  return res.status(200).json({reply:'Seedha sawaal poochho: career / money / love / health.'});
}
