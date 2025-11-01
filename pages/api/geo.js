// pages/api/geo.js

export default async function handler(req, res) {
  const { query, lat, lon } = req.query;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Google API key missing.' });
  }

  try {
    let geoData;
    if (query) {
      // ... Call Google Geocoding API with query
    } else if (lat && lon) {
      // ... Call Google Geocoding API with lat/lon
    } else {
      return res.status(400).json({ error: 'Missing query or lat/lon.' });
    }

    // ... Handle response and find lat/lng

    // ... Call Google Time Zone API with the found lat/lng
    const tzResponse = await fetch(`https://maps.googleapis.com/maps/api/timezone/json?...`);
    const tzData = await tzResponse.json();

    // ... Format and return the final data
    res.status(200).json({
        lat: location.lat,
        lon: location.lng,
        timezoneOffsetMinutes: Math.round((tzData.dstOffset + tzData.rawOffset) / 60),
        fullAddress: geoData.results[0].formatted_address,
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch location data.' });
  }
}
