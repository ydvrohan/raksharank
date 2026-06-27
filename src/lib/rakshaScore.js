// ─────────────────────────────────────────────────────────────────────────
// RAKSHA SCORE ENGINE
// This is the deterministic, transparent scoring logic behind RakshaRank.
// It does NOT depend on the AI — the AI only explains/contextualises this
// number. That keeps the score auditable and reproducible offline.
// ─────────────────────────────────────────────────────────────────────────
import { ALL_FACTORS } from './factors.js'

export const BASE_SCORE = 50

/**
 * calculateRakshaScore
 * @param {Object} factors - map of factorKey -> boolean (checked or not)
 * @returns {{
 *   score: number,
 *   rawScore: number,
 *   zone: 'Safer'|'Moderate'|'Risky'|'Unsafe',
 *   zoneColor: string,
 *   positiveHits: Array,
 *   negativeHits: Array,
 * }}
 */
export function calculateRakshaScore(factors = {}) {
  let score = BASE_SCORE
  const positiveHits = []
  const negativeHits = []

  ALL_FACTORS.forEach((factor) => {
    if (factors[factor.key]) {
      score += factor.points
      if (factor.points >= 0) positiveHits.push(factor)
      else negativeHits.push(factor)
    }
  })

  const rawScore = score
  const clamped = Math.max(0, Math.min(100, score))
  const zone = getZoneType(clamped)

  // Explicit breakdown — used by the Score Breakdown panel on the Result
  // page so the scoring is fully transparent and auditable.
  const totalPositive = positiveHits.reduce((sum, f) => sum + f.points, 0)
  const totalNegative = negativeHits.reduce((sum, f) => sum + f.points, 0)

  return {
    score: clamped,
    rawScore,
    baseScore: BASE_SCORE,
    totalPositive,
    totalNegative,
    wasClamped: rawScore !== clamped,
    zone: zone.label,
    zoneColor: zone.color,
    positiveHits,
    negativeHits,
  }
}

/**
 * getZoneType — maps a 0-100 score to a named risk zone.
 * 80-100 Safer · 60-79 Moderate · 40-59 Risky · 0-39 Unsafe
 */
export function getZoneType(score) {
  if (score >= 80) return { label: 'Safer', key: 'safer', color: 'zone-safer' }
  if (score >= 60) return { label: 'Moderate', key: 'moderate', color: 'zone-moderate' }
  if (score >= 40) return { label: 'Risky', key: 'risky', color: 'zone-risky' }
  return { label: 'Unsafe', key: 'unsafe', color: 'zone-unsafe' }
}

export function zoneKeyFromScore(score) {
  return getZoneType(score).key
}
