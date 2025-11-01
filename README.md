# Pavitra Gyaan — Google Geo + Timezone Pack
This adds:
- /api/geo to resolve birthplace -> (lat, lon, tz_offset_minutes) using Google Geocoding + Time Zone API.
- Location search input + "Use my location" button.
- Clean Hinglish UI with tabs/accordions and PDF.

## Setup
1) Upload this pack to your GitHub repo (root level).
2) On Vercel: Project Settings -> Environment Variables:
   - KEY: GOOGLE_MAPS_API_KEY, VALUE: <your key>
3) Redeploy. Visit the site.
4) Type birthplace -> "Find Place" OR click "Use my location". Fields auto-fill (lat/lon/tz).
5) Click "Generate Kundali".

Note: We call Google APIs server-side only in /api/geo; key is safe in Vercel env vars.
