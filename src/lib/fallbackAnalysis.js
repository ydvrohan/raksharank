// ─────────────────────────────────────────────────────────────────────────
// FALLBACK ANALYSIS (rule-based, deterministic, offline-safe)
//
// This module is intentionally framework-agnostic — no `import.meta.env`,
// no browser-only globals, no Node-only globals. That means it can be
// imported from BOTH:
//   1. the browser bundle (src/lib/geminiService.js), as a client-side
//      safety net for when /api/analyze itself is unreachable, and
//   2. the Vercel serverless function (api/analyze.js), as the server-side
//      fallback for when the Gemini API call fails or no key is set.
//
// Keeping ONE shared implementation means the two fallback paths can never
// drift out of sync.
// ─────────────────────────────────────────────────────────────────────────
import { titleCaseLocation, stripLeadingNear } from './textFormat.js'

const CATEGORY_KEYWORDS = [
  { category: 'ATM', words: ['atm', 'cash machine', 'kiosk'] },
  { category: 'Bus Stop', words: ['bus stop', 'bus stand', 'bus shelter'] },
  { category: 'Shop / Market', words: ['shop', 'market', 'bazaar', 'store', 'mall'] },
  { category: 'Residential Society', words: ['society', 'apartment', 'colony', 'flat', 'gate'] },
  { category: 'Public Park', words: ['park', 'garden', 'maidan'] },
  { category: 'Parking Area', words: ['parking', 'basement', 'lot'] },
  { category: 'Railway / Metro Station', words: ['station', 'railway', 'metro', 'platform'] },
  { category: 'Street / Road', words: ['street', 'road', 'lane', 'gali', 'alley', 'footpath', 'bridge'] },
]

function detectCategory(issueText) {
  const text = (issueText || '').toLowerCase()
  for (const entry of CATEGORY_KEYWORDS) {
    if (entry.words.some((w) => text.includes(w))) return entry.category
  }
  return 'Other Public Place'
}

function deriveUrgency(score, factors) {
  const hasHarassment = !!factors.harassment
  const hasLateNight = !!factors.lateNightRisk
  if (score < 40) return hasHarassment || hasLateNight ? 'Critical' : 'High'
  if (score < 60) return hasHarassment ? 'High' : 'Medium'
  if (score < 80) return hasHarassment || hasLateNight ? 'Medium' : 'Low'
  return 'Low'
}

function deriveDepartment(category, factors) {
  if (factors.harassment || factors.noPolicePatrol) {
    return 'Local Police Station / Women Safety Cell (Dial 1091 / 112)'
  }
  if (factors.brokenStreetlight) {
    return 'Municipal Corporation — Street Lighting Department'
  }
  if (factors.cctvAtm === false && category === 'ATM') {
    return 'Bank Branch Security Office + Local Police Station'
  }
  if (category === 'Bus Stop' || category === 'Railway / Metro Station') {
    return 'State Transport Authority / Railway Police (GRP)'
  }
  if (category === 'Residential Society') {
    return 'Resident Welfare Association (RWA) + Local Police Station'
  }
  if (factors.isolatedRoad || factors.noShopsHouses || factors.deserted) {
    return 'Municipal Corporation — Urban Planning & Public Works'
  }
  return 'Local Police Station'
}

function estimateResolutionTime(department, urgency) {
  if (department.includes('Police') && (urgency === 'Critical' || urgency === 'High')) {
    return '24–48 hours for initial police action'
  }
  if (department.includes('Street Lighting')) return '3–7 working days'
  if (department.includes('Urban Planning')) return '2–4 weeks'
  if (department.includes('Transport') || department.includes('Railway')) return '5–10 working days'
  if (department.includes('RWA')) return '3–5 working days'
  return '7–10 working days'
}

function buildScoreReason(score, zone, positiveHits, negativeHits) {
  const posPart = positiveHits.length
    ? `Supported by ${positiveHits.length} positive factor${positiveHits.length > 1 ? 's' : ''} (${positiveHits
        .map((f) => f.label)
        .join(', ')}).`
    : 'No positive safety factors were reported nearby.'
  const negPart = negativeHits.length
    ? `Pulled down by ${negativeHits.length} risk factor${negativeHits.length > 1 ? 's' : ''} (${negativeHits
        .map((f) => f.label)
        .join(', ')}).`
    : 'No major risk factors were reported.'
  return `This spot scored ${score}/100, placing it in the "${zone}" zone. ${posPart} ${negPart}`
}

// ───────────────────────── CLEAN SUBJECT / TITLE GENERATION ─────────────────────────
// Complaints and on-screen titles must NEVER use the raw, user-typed issue
// text verbatim — that often reads as casual Hinglish, which looks
// unprofessional in an official complaint. Instead we build a short, clean
// descriptor from the detected category + the single most relevant risk
// factor + the formatted location.

const CATEGORY_NOUN_EN = {
  'Street / Road': 'lane',
  'Bus Stop': 'bus stop',
  ATM: 'ATM',
  'Shop / Market': 'market area',
  'Residential Society': 'society entrance',
  'Public Park': 'park',
  'Parking Area': 'parking area',
  'Railway / Metro Station': 'station area',
  'Other Public Place': 'spot',
}

const CATEGORY_NOUN_HI = {
  'Street / Road': 'गली',
  'Bus Stop': 'बस स्टॉप',
  ATM: 'एटीएम',
  'Shop / Market': 'बाज़ार क्षेत्र',
  'Residential Society': 'सोसाइटी के प्रवेश द्वार',
  'Public Park': 'पार्क',
  'Parking Area': 'पार्किंग क्षेत्र',
  'Railway / Metro Station': 'स्टेशन क्षेत्र',
  'Other Public Place': 'स्थान',
}

// Ordered by severity/specificity — the first matching factor "wins" and
// becomes the headline adjective for the title + complaint subject.
const RISK_ADJECTIVES = [
  { key: 'harassment', en: 'harassment-prone', hi: 'छेड़छाड़-प्रवण' },
  { key: 'brokenStreetlight', en: 'dark', hi: 'अंधेरी' },
  { key: 'deserted', en: 'deserted', hi: 'सुनसान' },
  { key: 'isolatedRoad', en: 'isolated', hi: 'एकांत' },
  { key: 'noPolicePatrol', en: 'unpatrolled', hi: 'गश्त रहित' },
  { key: 'lateNightRisk', en: 'high-risk at night', hi: 'रात में जोखिम भरी' },
  { key: 'repeatedComplaints', en: 'repeatedly flagged', hi: 'बार-बार शिकायत वाली' },
  { key: 'noShopsHouses', en: 'isolated', hi: 'सुनसान' },
]
const DEFAULT_ADJECTIVE = { en: 'low-safety', hi: 'सुरक्षा-संबंधी' }

function pickAdjective(factors) {
  return RISK_ADJECTIVES.find((a) => factors[a.key]) || DEFAULT_ADJECTIVE
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

/**
 * buildCleanTitle — short, professional on-screen title.
 * e.g. "Dark Lane — College Road, Jalandhar"
 */
function buildCleanTitle(category, factors, formattedLocation) {
  const noun = CATEGORY_NOUN_EN[category] || 'Spot'
  const adj = pickAdjective(factors)
  return `${capitalize(adj.en)} ${capitalize(noun)} — ${formattedLocation}`
}

/**
 * buildSubjects — clean, formal complaint subject lines in both languages.
 * English e.g. "Complaint regarding unsafe dark lane near College Road, Jalandhar"
 * Hindi   e.g. "कॉलेज रोड, जालंधर के पास असुरक्षित अंधेरी गली के संबंध में शिकायत"
 */
function buildSubjects(category, factors, formattedLocation) {
  const nounEn = CATEGORY_NOUN_EN[category] || 'spot'
  const nounHi = CATEGORY_NOUN_HI[category] || 'स्थान'
  const adj = pickAdjective(factors)
  // Templates below already supply their own connecting word ("near" / "के
  // पास") — strip a leading "Near" from the location first or it doubles up.
  const bareLocation = stripLeadingNear(formattedLocation)
  return {
    subjectEnglish: `Complaint regarding unsafe ${adj.en} ${nounEn} near ${bareLocation}`,
    subjectHindi: `${bareLocation} के पास असुरक्षित ${adj.hi} ${nounHi} के संबंध में शिकायत`,
  }
}

function buildComplaintEnglish({ subjectEnglish, location, time, department, issueText }) {
  return `To,\nThe Concerned Officer,\n${department},\n\nSubject: ${subjectEnglish}\n\nRespected Sir/Madam,\n\nI would like to bring to your notice a safety concern at ${location}, observed around ${time}. ${issueText} This poses a risk to the safety of women and other pedestrians using this area.\n\nI request you to kindly look into this matter and take appropriate corrective action at the earliest.\n\nThank you,\nA Concerned Citizen (via RakshaRank)`
}

function buildComplaintHindi({ subjectHindi, location, time, department, issueText }) {
  return `प्रति,\nसंबंधित अधिकारी,\n${department},\n\nविषय: ${subjectHindi}\n\nमहोदय/महोदया,\n\nमैं आपका ध्यान ${location} पर एक सुरक्षा संबंधी समस्या की ओर आकर्षित करना चाहती/चाहता हूँ, जो लगभग ${time} के समय देखी गई। ${issueText} इससे महिलाओं और अन्य राहगीरों की सुरक्षा को खतरा है।\n\nआपसे विनम्र निवेदन है कि इस मामले की जांच कर उचित कार्रवाई जल्द से जल्द की जाए।\n\nधन्यवाद,\nएक जागरूक नागरिक (RakshaRank के माध्यम से)`
}

function buildSafetyTips(factors, urgency) {
  const tips = []
  if (factors.brokenStreetlight) tips.push('Avoid this stretch after dark until the streetlight is repaired; prefer a better-lit parallel route.')
  if (factors.deserted || factors.isolatedRoad) tips.push('Avoid travelling alone here during low-footfall hours; share your live location with a trusted contact.')
  if (factors.harassment) tips.push('If you face harassment here, call 1091 (Women Helpline) or 112 (Emergency) immediately and move toward the nearest open shop or guard post.')
  if (factors.lateNightRisk) tips.push('Plan to pass this spot before 9–10 PM where possible; use a cab/auto with a known driver for late hours.')
  if (factors.noPolicePatrol) tips.push('Note down the nearest landmark and keep emergency numbers handy, since visible patrolling is low here.')
  if (!factors.cctvAtm && !factors.cctvShop) tips.push('Since CCTV coverage is limited, stay in groups when possible and stay visible/near open establishments.')
  // Always-on general tips to round out the list
  tips.push('Save local police, 112, and a trusted contact on speed dial before stepping out.')
  tips.push('Keep your phone charged and location sharing on when moving through unfamiliar areas.')
  return [...new Set(tips)].slice(0, 5)
}

/**
 * buildFallbackAnalysis — fully synchronous, deterministic, offline-safe.
 * Used by api/analyze.js whenever Gemini fails, by geminiService.js whenever
 * /api/analyze itself is unreachable, and to seed demo data.
 *
 * @param {string} issueText
 * @param {string} location
 * @param {string} time
 * @param {Object} factors - { factorKey: boolean }
 * @param {Object} rakshaScoreResult - output of calculateRakshaScore()
 */
export function buildFallbackAnalysis(issueText, location, time, factors, rakshaScoreResult) {
  const category = detectCategory(issueText)
  const urgency = deriveUrgency(rakshaScoreResult.score, factors)
  const department = deriveDepartment(category, factors)
  // titleCaseLocation keeps a user-typed "near" for display purposes
  // elsewhere, but generated sentences below supply their own connecting
  // word ("near" / "at" / "के पास") — so strip it here to avoid "near Near X".
  const cleanLocation = stripLeadingNear(titleCaseLocation(location))

  const title = buildCleanTitle(category, factors, cleanLocation)
  const { subjectEnglish, subjectHindi } = buildSubjects(category, factors, cleanLocation)

  const context = {
    subjectEnglish,
    subjectHindi,
    location: cleanLocation,
    time,
    department,
    issueText,
  }

  return {
    title,
    category,
    urgency,
    scoreReason: buildScoreReason(
      rakshaScoreResult.score,
      rakshaScoreResult.zone,
      rakshaScoreResult.positiveHits,
      rakshaScoreResult.negativeHits
    ),
    department,
    suggestedAction:
      urgency === 'Critical' || urgency === 'High'
        ? `File this complaint with ${department} immediately and avoid the spot alone until action is visible.`
        : `Submit this report to ${department} so corrective steps (lighting, patrolling, or CCTV) can be planned.`,
    complaintSubjectEnglish: subjectEnglish,
    complaintSubjectHindi: subjectHindi,
    complaintEnglish: buildComplaintEnglish(context),
    complaintHindi: buildComplaintHindi(context),
    safetyTips: buildSafetyTips(factors, urgency),
    estimatedResolutionTime: estimateResolutionTime(department, urgency),
    positiveFactors: rakshaScoreResult.positiveHits.map((f) => f.label),
    riskFactors: rakshaScoreResult.negativeHits.map((f) => f.label),
    source: 'fallback',
  }
}
