// Central definition of every hyperlocal safety factor RakshaRank understands.
// Used by: the report form (checkboxes), calculateRakshaScore (lib/rakshaScore.js),
// and the AI service (lib/geminiService.js) for building prompts + fallback reasoning.

export const POSITIVE_FACTORS = [
  { key: 'policeStation', label: 'Nearby police station', points: 20 },
  { key: 'cctvAtm', label: 'CCTV near ATM', points: 15 },
  { key: 'cctvShop', label: 'CCTV outside shop', points: 12 },
  { key: 'residentialSociety', label: 'Residential society nearby', points: 15 },
  { key: 'streetLighting', label: 'Good street lighting', points: 10 },
  { key: 'publicMovement', label: 'Public movement / crowded area', points: 10 },
  { key: 'openShops', label: 'Open shops nearby', points: 8 },
  { key: 'securityGuard', label: 'Security guard nearby', points: 8 },
]

export const NEGATIVE_FACTORS = [
  { key: 'deserted', label: 'Deserted / sunsaan area', points: -25 },
  { key: 'harassment', label: 'Harassment / loitering', points: -25 },
  { key: 'lateNightRisk', label: 'Late night risk', points: -20 },
  { key: 'brokenStreetlight', label: 'Broken streetlight', points: -20 },
  { key: 'isolatedRoad', label: 'Isolated road', points: -15 },
  { key: 'repeatedComplaints', label: 'Repeated safety complaints', points: -15 },
  { key: 'noPolicePatrol', label: 'No visible police patrolling', points: -15 },
  { key: 'noShopsHouses', label: 'No shops or houses nearby', points: -12 },
]

export const ALL_FACTORS = [...POSITIVE_FACTORS, ...NEGATIVE_FACTORS]

export const FACTOR_MAP = ALL_FACTORS.reduce((acc, f) => {
  acc[f.key] = f
  return acc
}, {})

// Spot categories a reporter can be describing — used for AI category detection
export const SPOT_CATEGORIES = [
  'Street / Road',
  'Bus Stop',
  'ATM',
  'Shop / Market',
  'Residential Society',
  'Public Park',
  'Parking Area',
  'Railway / Metro Station',
  'Other Public Place',
]

export function emptyFactorState() {
  return ALL_FACTORS.reduce((acc, f) => {
    acc[f.key] = false
    return acc
  }, {})
}
