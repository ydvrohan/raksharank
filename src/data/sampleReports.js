// ─────────────────────────────────────────────────────────────────────────
// SEED DATA — sample community reports so the Dashboard & Heatmap have
// something to show on a brand-new browser (first run / live demo).
// Generated through the exact same scoring + fallback-AI pipeline a real
// user submission goes through — nothing here is hand-faked data.
// ─────────────────────────────────────────────────────────────────────────
import { calculateRakshaScore } from '../lib/rakshaScore.js'
import { buildFallbackAnalysis } from '../lib/fallbackAnalysis.js'
import { emptyFactorState } from '../lib/factors.js'

function makeSeed({ id, daysAgo, issueText, location, time, status, factorKeys }) {
  const factors = { ...emptyFactorState() }
  factorKeys.forEach((k) => (factors[k] = true))

  const score = calculateRakshaScore(factors)
  const ai = buildFallbackAnalysis(issueText, location, time, factors, score)
  const createdAt = new Date(Date.now() - daysAgo * 86400000).toISOString()

  return { id, issueText, location, time, factors, status, createdAt, score, ai }
}

export const SEED_REPORTS = [
  makeSeed({
    id: 'RR-SEED-001',
    daysAgo: 1,
    issueText: 'The street near the metro exit has no working streetlight and is very deserted after 9 PM.',
    location: 'Hauz Khas Metro Exit Lane, Delhi',
    time: '9 PM – 11 PM',
    status: 'Reported',
    factorKeys: ['brokenStreetlight', 'deserted', 'lateNightRisk', 'noShopsHouses'],
  }),
  makeSeed({
    id: 'RR-SEED-002',
    daysAgo: 3,
    issueText: 'Group of men loiter and pass comments near the bus stop every evening, no police patrol seen.',
    location: 'Whitefield Main Road Bus Stop, Bengaluru',
    time: '6 PM – 8 PM',
    status: 'In Progress',
    factorKeys: ['harassment', 'noPolicePatrol', 'openShops'],
  }),
  makeSeed({
    id: 'RR-SEED-003',
    daysAgo: 6,
    issueText: 'Well-lit market lane with a police booth and active shopkeepers, feels safe even at night.',
    location: 'Linking Road Market Lane, Mumbai',
    time: '8 PM – 10 PM',
    status: 'Resolved',
    factorKeys: ['streetLighting', 'policeStation', 'openShops', 'publicMovement', 'cctvShop'],
  }),
  makeSeed({
    id: 'RR-SEED-004',
    daysAgo: 9,
    issueText: 'ATM lane behind the society has a working CCTV but the approach road is isolated and dark.',
    location: 'Salt Lake Sector V ATM Lane, Kolkata',
    time: '7 PM – 9 PM',
    status: 'Reported',
    factorKeys: ['cctvAtm', 'isolatedRoad', 'brokenStreetlight'],
  }),
  makeSeed({
    id: 'RR-SEED-005',
    daysAgo: 12,
    issueText: 'Residential society entrance has a security guard and good lighting, generally feels secure.',
    location: 'Jubilee Hills Society Gate, Hyderabad',
    time: 'All hours',
    status: 'Resolved',
    factorKeys: ['securityGuard', 'residentialSociety', 'streetLighting', 'publicMovement'],
  }),
  makeSeed({
    id: 'RR-SEED-006',
    daysAgo: 14,
    issueText: 'Underpass connecting two colonies has repeated complaints, no shops, and frequent loitering at night.',
    location: 'Shastri Nagar Underpass, Jaipur',
    time: '10 PM – 1 AM',
    status: 'Reported',
    factorKeys: ['repeatedComplaints', 'noShopsHouses', 'harassment', 'lateNightRisk', 'noPolicePatrol'],
  }),
]
