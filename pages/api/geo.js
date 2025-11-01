
import fetch from "node-fetch";

function extractCountry(components){
  try{
    const c = (components||[]).find(x => x.types?.includes("country"));
    return c?.long_name || c?.short_name || "";
  }catch{return ""}
}

export default async function handler(req, res){
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if(!key) return res.status(400).json({error:"Missing GOOGLE_MAPS_API_KEY"});

  const { query, lat, lon } = req.query || {};

  try{
    let location = null, formatted = "", country = "";
    if (query){
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${key}`;
      const g = await fetch(url); const gj = await g.json();
      if(gj.status!=="OK" || !gj.results?.length) return res.status(404).json({error:"Place not found"});
      const r = gj.results[0];
      location = r.geometry.location;
      formatted = r.formatted_address;
      country = extractCountry(r.address_components);
    }else if(lat && lon){
      location = { lat: parseFloat(lat), lng: parseFloat(lon) };
      formatted = `${lat}, ${lon}`;
    }else{
      return res.status(400).json({error:"Provide ?query=City or ?lat=..&lon=.."});
    }

    const ts = Math.floor(Date.now()/1000);
    const tzUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${location.lat},${location.lng}&timestamp=${ts}&key=${key}`;
    const tz = await fetch(tzUrl); const tzj = await tz.json();
    if(tzj.status!=="OK") return res.status(500).json({error:"Timezone lookup failed", detail: tzj.status});
    const offsetMinutes = Math.round(((tzj.rawOffset||0)+(tzj.dstOffset||0))/60);

    return res.status(200).json({
      lat: location.lat, lon: location.lng,
      tz_offset_minutes: offsetMinutes,
      address: formatted, country: country || tzj.timeZoneId || ""
    });
  }catch(e){
    return res.status(500).json({error:e.message||"Unknown error"});
  }
}
