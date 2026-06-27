import React from 'react'
import { MapPinned } from 'lucide-react'
import { titleCaseLocation } from '../lib/textFormat.js'

// ─────────────────────────────────────────────────────────────────────────
// SAFETY HEATMAP (grid-based, no map API / no GPS / no real CCTV access)
// Aggregates every reported location into a colour-coded tile. Colour
// intensity = average Raksha Score for that location across all reports.
// ─────────────────────────────────────────────────────────────────────────

const ZONE_TILE = {
  Safer: { bg: 'bg-zone-safer', text: 'text-white', label: 'Safer' },
  Moderate: { bg: 'bg-zone-moderate', text: 'text-night', label: 'Moderate' },
  Risky: { bg: 'bg-zone-risky', text: 'text-white', label: 'Risky' },
  Unsafe: { bg: 'bg-zone-unsafe', text: 'text-white', label: 'Unsafe' },
}

export function zoneFromScore(score) {
  if (score >= 80) return 'Safer'
  if (score >= 60) return 'Moderate'
  if (score >= 40) return 'Risky'
  return 'Unsafe'
}

function topFactorLabel(reportsAtLocation, hitsKey) {
  const counts = {}
  reportsAtLocation.forEach((r) => {
    ;(r.score?.[hitsKey] || []).forEach((f) => {
      counts[f.label] = (counts[f.label] || 0) + 1
    })
  })
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return sorted.length ? sorted[0][0] : null
}

/** Plain-language "why this zone?" line shown on every heatmap tile. */
function buildZoneReason(zone, topPositive, topNegative) {
  if ((zone === 'Risky' || zone === 'Unsafe') && topNegative) {
    return `Pulled down mainly by reports of "${topNegative}".`
  }
  if ((zone === 'Safer' || zone === 'Moderate') && topPositive) {
    return `Boosted mainly by reports of "${topPositive}".`
  }
  if (topNegative) return `Most reported concern here: "${topNegative}".`
  if (topPositive) return `Most reported strength here: "${topPositive}".`
  return 'Not enough factor data yet — report this spot to sharpen the reason.'
}

export function aggregateByLocation(reports) {
  const groups = {}
  reports.forEach((r) => {
    if (!groups[r.location]) groups[r.location] = { location: r.location, scores: [], reports: [] }
    groups[r.location].scores.push(r.score.score)
    groups[r.location].reports.push(r)
  })

  return Object.values(groups)
    .map((g) => {
      const avgScore = Math.round(g.scores.reduce((a, b) => a + b, 0) / g.scores.length)
      const zone = zoneFromScore(avgScore)
      const topPositive = topFactorLabel(g.reports, 'positiveHits')
      const topNegative = topFactorLabel(g.reports, 'negativeHits')
      return {
        location: g.location,
        formattedLocation: titleCaseLocation(g.location),
        count: g.reports.length,
        avgScore,
        zone,
        reason: buildZoneReason(zone, topPositive, topNegative),
      }
    })
    .sort((a, b) => a.avgScore - b.avgScore)
}

/**
 * getCommunityStats — powers the Heatmap page's top summary bar:
 * Most Urgent Zone, Average Raksha Score, Total Unsafe Zones,
 * Total Community Reports, Recommended Action.
 */
export function getCommunityStats(reports) {
  const tiles = aggregateByLocation(reports) // already sorted ascending by avgScore
  const totalReports = reports.length
  const avgScore = totalReports ? Math.round(reports.reduce((s, r) => s + r.score.score, 0) / totalReports) : 0
  const totalUnsafeZones = tiles.filter((t) => t.zone === 'Unsafe').length
  const mostUrgentZone = tiles.length ? tiles[0] : null

  const topRiskFactor = topFactorLabel(reports, 'negativeHits')
  const recommendedAction = topRiskFactor
    ? `Prioritize fixing "${topRiskFactor}" — it's the most common risk factor across all community reports.`
    : totalUnsafeZones > 0
      ? 'Increase patrolling and lighting checks across the flagged zones below.'
      : 'No dominant risk pattern yet — keep the reports coming to sharpen the picture.'

  return { tiles, totalReports, avgScore, totalUnsafeZones, mostUrgentZone, topRiskFactor, recommendedAction }
}

export default function HeatmapGrid({ reports }) {
  const tiles = aggregateByLocation(reports)

  if (tiles.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-night/15 p-10 text-center text-ink-soft">
        No reports yet. Be the first to report a spot near you.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tiles.map((tile) => {
        const style = ZONE_TILE[tile.zone]
        return (
          <div
            key={tile.location}
            className={`${style.bg} ${style.text} rounded-2xl p-5 flex flex-col justify-between min-h-[170px] shadow-card relative overflow-hidden`}
          >
            <div className="absolute -right-4 -top-4 opacity-15">
              <MapPinned size={90} />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{style.label} zone</p>
                <span className="text-[11px] font-semibold rounded-full bg-black/15 px-2 py-0.5 flex-shrink-0">
                  {tile.count} report{tile.count > 1 ? 's' : ''}
                </span>
              </div>
              <p className="font-display font-semibold text-base mt-1.5 leading-snug">{tile.formattedLocation}</p>
            </div>

            <div className="relative">
              <p className="text-xs opacity-85 leading-relaxed mb-2">{tile.reason}</p>
              <div className="flex items-end justify-between">
                <span className="font-mono text-3xl font-bold">{tile.avgScore}</span>
                <span className="text-[10px] uppercase tracking-wide opacity-70">/100 avg</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
