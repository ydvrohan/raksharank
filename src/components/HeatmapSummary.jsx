import React from 'react'
import { AlertTriangle, Gauge, ShieldOff, Users, Lightbulb } from 'lucide-react'

export default function HeatmapSummary({ stats }) {
  const { mostUrgentZone, avgScore, totalUnsafeZones, totalReports, recommendedAction } = stats

  const ZONE_AVG_COLOR =
    avgScore >= 80 ? 'text-zone-safer' : avgScore >= 60 ? 'text-zone-moderate' : avgScore >= 40 ? 'text-zone-risky' : 'text-zone-unsafe'

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Tile
        icon={AlertTriangle}
        label="Most urgent zone"
        value={mostUrgentZone ? mostUrgentZone.formattedLocation : '—'}
        sub={mostUrgentZone ? `Score ${mostUrgentZone.avgScore} · ${mostUrgentZone.zone}` : 'No reports yet'}
        accent="text-zone-unsafe"
      />
      <Tile icon={Gauge} label="Average Raksha Score" value={`${avgScore}/100`} accent={ZONE_AVG_COLOR} />
      <Tile icon={ShieldOff} label="Total unsafe zones" value={totalUnsafeZones} accent="text-zone-unsafe" />
      <Tile icon={Users} label="Total community reports" value={totalReports} accent="text-ink" />

      <div className="sm:col-span-2 lg:col-span-4 rounded-2xl border border-marigold/25 bg-marigold/5 p-4 flex items-start gap-3">
        <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-marigold/15 text-marigold-dark">
          <Lightbulb size={16} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-marigold-dark mb-0.5">Recommended action</p>
          <p className="text-sm text-ink-soft leading-relaxed">{recommendedAction}</p>
        </div>
      </div>
    </div>
  )
}

function Tile({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-night/10 p-4">
      <div className="flex items-center gap-2 mb-2 text-ink-soft">
        <Icon size={14} />
        <span className="text-xs">{label}</span>
      </div>
      <p className={`font-mono text-xl font-bold leading-tight truncate ${accent}`} title={String(value)}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-ink-soft/70 mt-1">{sub}</p>}
    </div>
  )
}
