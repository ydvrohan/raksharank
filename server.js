// ─────────────────────────────────────────────────────────────────────────
// server.js — single Node/Express server for Google Cloud Run
//
// Replaces the old Vercel serverless function (api/analyze.js is no longer
// used — keep it only if you still want a parallel Vercel deployment).
// This one process does two jobs:
//   1. Serves the built frontend (the `dist/` folder produced by
//      `npm run build`) as static files, with an SPA fallback so React
//      Router routes like /report or /dashboard work on a hard refresh.
//   2. Implements POST /api/analyze — the exact same logic that used to
//      live in api/analyze.js, reusing the same framework-agnostic
//      src/lib modules so scoring/complaint logic can never drift between
//      environments.
//
// Cloud Run requirements this satisfies:
//   - Listens on the port Cloud Run injects via process.env.PORT (8080
//     locally if unset).
//   - Reads GEMINI_API_KEY from the environment — set it as a Cloud Run
//     environment variable / secret, never bake it into the image.
// ─────────────────────────────────────────────────────────────────────────
import 'dotenv/config' // loads .env locally; harmless no-op on Cloud Run (real env vars win)
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { calculateRakshaScore } from './src/lib/rakshaScore.js'
import { buildFallbackAnalysis } from './src/lib/fallbackAnalysis.js'
import { FACTOR_MAP } from './src/lib/factors.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json())

const PORT = process.env.PORT || 8080

// 🔑 STEP 1 — Get a free API key from Google AI Studio: https://aistudio.google.com/app/apikey
// 🔑 STEP 2 — Set it as an environment variable named GEMINI_API_KEY:
//             - Local: copy .env.example to .env and fill it in, then
//               `npm run build && npm start` (or just `npm run dev:server`).
//             - Cloud Run: `gcloud run deploy --set-env-vars GEMINI_API_KEY=...`
//               or, better, store it in Secret Manager and mount it as an
//               env var (see README for the exact command).
// 🔑 STEP 3 — No key set? Every request automatically uses the same
//             deterministic, offline-safe analyzer used everywhere else in
//             this app (src/lib/fallbackAnalysis.js) — the app never breaks.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.0-flash' // swap for any model available in your AI Studio account
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

function buildPrompt({ issueText, location, time, factorLabels, rakshaScoreResult }) {
  return `You are RakshaRank's safety analysis engine for India. A citizen has reported a hyperlocal women-safety issue. You do NOT have access to any real CCTV, police, or live database — base your analysis ONLY on the report text and the selected safety factors below.

Issue description: "${issueText}"
Location: "${location}"
Time of issue: "${time}"
Selected nearby safety factors: ${factorLabels.length ? factorLabels.join(', ') : 'None selected'}
Computed Raksha Score (rule-based, already final — do not recalculate): ${rakshaScoreResult.score} / 100
Score breakdown: base ${rakshaScoreResult.baseScore}, +${rakshaScoreResult.totalPositive} positive, ${rakshaScoreResult.totalNegative} negative
Zone: ${rakshaScoreResult.zone}

Respond with ONLY a valid JSON object (no markdown, no commentary) with exactly these snake_case keys:
{
  "issue_title": "a short, professional title — NOT the raw issue text verbatim. Format as '<Adjective> <Spot type> — <Location>', e.g. 'Dark Lane — College Road, Jalandhar'. Max 8 words.",
  "category": "one of: Street / Road, Bus Stop, ATM, Shop / Market, Residential Society, Public Park, Parking Area, Railway / Metro Station, Other Public Place",
  "urgency": "one of: Low, Medium, High, Critical",
  "score_reason": "2-3 sentences explaining why the score landed here, referencing the selected factors",
  "responsible_department": "the most relevant responsible Indian civic/police department for this issue",
  "suggested_action": "1-2 sentences, the single most useful next action for the reporter or authority",
  "complaint_subject_english": "a clean, professional complaint subject line in English, e.g. 'Complaint regarding unsafe dark lane near College Road, Jalandhar'. Do NOT copy the user's raw issue text into this subject.",
  "complaint_subject_hindi": "the same subject translated naturally into formal Hindi, e.g. 'कॉलेज रोड, जालंधर के पास असुरक्षित अंधेरी गली के संबंध में शिकायत'",
  "complaint_english": "a polite, formal complaint paragraph in English addressed to the responsible department, using complaint_subject_english as its Subject line",
  "complaint_hindi": "a polite, formal complaint paragraph in Hindi addressed to the responsible department, using complaint_subject_hindi as its Subject line",
  "safety_tips": ["3 to 5 short, practical personal-safety tips relevant to this exact spot/time"],
  "estimated_resolution_time": "a realistic estimate, e.g. '3-5 working days' or '24-48 hours'"
}`
}

/** Converts buildFallbackAnalysis()'s camelCase shape into the snake_case wire format. */
function fallbackToWire(camel) {
  return {
    issue_title: camel.title,
    category: camel.category,
    urgency: camel.urgency,
    score_reason: camel.scoreReason,
    positive_safety_factors: camel.positiveFactors,
    risk_factors: camel.riskFactors,
    responsible_department: camel.department,
    suggested_action: camel.suggestedAction,
    complaint_subject_english: camel.complaintSubjectEnglish,
    complaint_subject_hindi: camel.complaintSubjectHindi,
    complaint_english: camel.complaintEnglish,
    complaint_hindi: camel.complaintHindi,
    safety_tips: camel.safetyTips,
    estimated_resolution_time: camel.estimatedResolutionTime,
    source: 'fallback',
  }
}

// ───────────────────────── /api/analyze ─────────────────────────
app.post('/api/analyze', async (req, res) => {
  const { issueText = '', location = '', time = '', factors = {} } = req.body || {}

  // Authoritative score, recomputed server-side — never trust the client's number.
  const rakshaScoreResult = calculateRakshaScore(factors)

  if (!GEMINI_API_KEY) {
    const fallback = buildFallbackAnalysis(issueText, location, time, factors, rakshaScoreResult)
    res.status(200).json(fallbackToWire(fallback))
    return
  }

  try {
    const factorLabels = Object.keys(factors)
      .filter((k) => factors[k])
      .map((k) => FACTOR_MAP[k]?.label)
      .filter(Boolean)

    const prompt = buildPrompt({ issueText, location, time, factorLabels, rakshaScoreResult })

    const geminiResponse = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
      }),
    })

    if (!geminiResponse.ok) throw new Error(`Gemini API error: ${geminiResponse.status}`)

    const data = await geminiResponse.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Gemini returned an empty response')

    const cleaned = text.replace(/```json|```/g, '').trim()
    const wire = JSON.parse(cleaned)

    // Factor lists always come from our own score engine, not from
    // whatever Gemini echoes back, so they can never drift from the truth.
    wire.positive_safety_factors = rakshaScoreResult.positiveHits.map((f) => f.label)
    wire.risk_factors = rakshaScoreResult.negativeHits.map((f) => f.label)
    wire.source = 'gemini'

    res.status(200).json(wire)
  } catch (err) {
    console.error('RakshaRank /api/analyze: Gemini call failed, using fallback —', err.message)
    const fallback = buildFallbackAnalysis(issueText, location, time, factors, rakshaScoreResult)
    res.status(200).json(fallbackToWire(fallback))
  }
})

// Reject other methods on this route explicitly (same behaviour as the old Vercel function).
app.all('/api/analyze', (req, res) => {
  res.status(405).json({ error: 'Method not allowed. POST a report to /api/analyze.' })
})

// Simple liveness check — handy for Cloud Run smoke tests / uptime checks.
app.get('/healthz', (req, res) => res.status(200).send('ok'))

// ───────────────────────── Static frontend (built by `npm run build`) ─────────────────────────
const distPath = path.join(__dirname, 'dist')
app.use(express.static(distPath))

// SPA fallback: any other GET request (e.g. a hard refresh on /dashboard)
// gets index.html so React Router can take over client-side.
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`RakshaRank server listening on port ${PORT}`)
  console.log(`Gemini integration: ${GEMINI_API_KEY ? 'ENABLED' : 'using offline fallback (no GEMINI_API_KEY set)'}`)
})
