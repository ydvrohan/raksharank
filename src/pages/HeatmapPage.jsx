import React, { useEffect, useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import HeatmapGrid, { getCommunityStats } from '../components/HeatmapGrid.jsx'
import HeatmapSummary from '../components/HeatmapSummary.jsx'
import { getReports } from '../lib/storage.js'

const LEGEND = [
  { label: 'Safer', range: '80–100', color: 'bg-zone-safer' },
  { label: 'Moderate', range: '60–79', color: 'bg-zone-moderate' },
  { label: 'Risky', range: '40–59', color: 'bg-zone-risky' },
  { label: 'Unsafe', range: '0–39', color: 'bg-zone-unsafe' },
]

export default function HeatmapPage() {
  const [reports, setReports] = useState([])

  useEffect(() => {
    setReports(getReports())
  }, [])

  const stats = useMemo(() => getCommunityStats(reports), [reports])

  return (
    <div className="container-page py-12">
      <div className="mb-6">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink">Safety Heatmap</h1>
        <p className="mt-2 text-ink-soft max-w-2xl">
          A grid-based view of every reported locality, coloured by its average Raksha Score. This is a community
          data visual, not a live map — RakshaRank uses no real GPS, satellite, or CCTV feed.
        </p>
      </div>

      <HeatmapSummary stats={stats} />

      <div className="flex flex-wrap items-center gap-4 mb-8 bg-white rounded-2xl border border-night/10 p-4">
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-2 text-sm text-ink-soft">
            <span className={`h-3 w-3 rounded-full ${l.color}`} />
            {l.label} <span className="text-ink-soft/50">({l.range})</span>
          </div>
        ))}
      </div>

      <HeatmapGrid reports={reports} />

      <div className="mt-8 flex items-start gap-3 rounded-2xl bg-marigold/5 border border-marigold/20 p-5 text-sm text-ink-soft">
        <Info size={18} className="text-marigold-dark flex-shrink-0 mt-0.5" />
        Tile colour and score reflect the average of all community reports for that exact location string. Report
        more spots from the same area to sharpen its score over time.
      </div>
    </div>
  )
}
