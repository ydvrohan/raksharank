// ─────────────────────────────────────────────────────────────────────────
// GEMINI CLIENT (frontend)
//
// IMPORTANT — SECURITY: this file holds NO Gemini API key, and never will.
// The key lives only in the Vercel serverless function (api/analyze.js),
// read server-side via process.env.GEMINI_API_KEY. The browser only ever
// talks to our own same-origin /api/analyze endpoint.
//
// analyzeSafetyIssueWithGemini() is the single entry point the UI calls:
//   1. POSTs the report to /api/analyze.
//   2. Maps the API's snake_case wire JSON into the camelCase shape the
//      existing UI (AIResultPanel, ReportCard, ...) already expects — so
//      no UI component needs to change.
//   3. If the request fails for ANY reason (network down, /api/analyze not
//      available — e.g. running plain `vite dev` without `vercel dev` —
//      malformed response, etc.) it falls back to the same deterministic,
//      offline-safe analysis used server-side, so the app NEVER breaks.
// ─────────────────────────────────────────────────────────────────────────
import { buildFallbackAnalysis } from './fallbackAnalysis.js'

const ANALYZE_ENDPOINT = '/api/analyze'

/**
 * Maps the API route's snake_case JSON contract to the camelCase `ai`
 * object shape every UI component in this app already consumes.
 */
function fromWireFormat(wire) {
  return {
    title: wire.issue_title,
    category: wire.category,
    urgency: wire.urgency,
    scoreReason: wire.score_reason,
    positiveFactors: wire.positive_safety_factors || [],
    riskFactors: wire.risk_factors || [],
    department: wire.responsible_department,
    suggestedAction: wire.suggested_action,
    complaintSubjectEnglish: wire.complaint_subject_english,
    complaintSubjectHindi: wire.complaint_subject_hindi,
    complaintEnglish: wire.complaint_english,
    complaintHindi: wire.complaint_hindi,
    safetyTips: wire.safety_tips || [],
    estimatedResolutionTime: wire.estimated_resolution_time,
    source: wire.source || 'gemini',
  }
}

/**
 * analyzeSafetyIssueWithGemini — the function the UI calls.
 *
 * @param {string} issueText
 * @param {string} location
 * @param {string} time
 * @param {Object} factors - { factorKey: boolean }
 * @param {Object} rakshaScore - the full result object from calculateRakshaScore()
 *                               (score, zone, positiveHits, negativeHits, baseScore, ...)
 * @param {Object} scoreBreakdown - explicit breakdown sent to the AI prompt for
 *                               transparency: { baseScore, positivePoints, negativePoints, finalScore }
 */
export async function analyzeSafetyIssueWithGemini(issueText, location, time, factors, rakshaScore, scoreBreakdown) {
  try {
    const response = await fetch(ANALYZE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issueText,
        location,
        time,
        factors,
        rakshaScore: rakshaScore?.score,
        scoreBreakdown,
      }),
    })

    if (!response.ok) {
      throw new Error(`/api/analyze responded with ${response.status}`)
    }

    const wire = await response.json()
    return fromWireFormat(wire)
  } catch (err) {
    // Expected whenever /api/analyze isn't reachable — e.g. running plain
    // `vite dev` without `vercel dev`, or a genuine network error. The
    // route itself already falls back to local analysis when Gemini
    // fails, so this client-side catch is the second line of defence.
    console.info('RakshaRank: /api/analyze unreachable, using local fallback —', err.message)
    return buildFallbackAnalysis(issueText, location, time, factors, rakshaScore)
  }
}
