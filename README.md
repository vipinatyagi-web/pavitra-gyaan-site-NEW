# Pavitra Gyaan — Next.js + OpenAI (Vercel-ready)

Deploy:
1) Push these files to a GitHub repo.
2) Go to https://vercel.com → New Project → Import repo → Deploy.
3) Project → Settings → Environment Variables:
   - Name: OPENAI_API_KEY, Value: <your key>
   - Add to Production & Preview, Save → Redeploy.
4) Open your site URL → form → Generate.

If you see 404 on Vercel, ensure:
- The folder has /pages/index.js at project root.
- Build succeeds in Vercel logs.
