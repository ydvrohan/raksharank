import React from 'react'
import { Calculator } from 'lucide-react'

const ZONE_TEXT = {
  Safer: 'text-zone-safer',
  Moderate: 'text-zone-moderate',
  Risky: 'text-zone-risky',
  Unsafe: 'text-zone-unsafe',
}

function Row({ label, value, tone, bold = false, colorClass }) {
  const toneClass =
    colorClass || (tone === 'positive' ? 'text-zone-safer' : tone === 'negative' ? 'text-zone-unsafe' : 'text-ink')
  return (
    <div className={`flex items-center justify-between py-2.5 ${bold ? '' : 'border-b border-night/5'}`}>
      <span className={`text-sm ${bold ? 'font-semibold text-ink' : 'text-ink-soft'}`}>{label}</span>
      <span className={`font-mono text-sm font-bold ${bold ? 'text-base' : ''} ${toneClass}`}>{value}</span>
    </div>
  )
}

/**
 * Transparent, auditable breakdown of how the Raksha Score was calculated:
 * Base score → + positive points → − negative points → Final score.
 */
export default function ScoreBreakdown({ score }) {
  const { baseScore, totalPositive, totalNegative, score: finalScore, rawScore, wasClamped, zone } = score

  return (
    <div className="rounded-2xl border border-night/10 p-5 bg-white">
      <h3 className="flex items-center gap-2 font-display font-semibold text-ink text-sm mb-1">
        <Calculator size={16} className="text-sindoor" /> Score breakdown
      </h3>
      <p className="text-xs text-ink-soft mb-2">Fully transparent — every point is traceable to a factor you selected.</p>

      <div>
        <Row label="Base score" value={baseScore} />
        <Row label="Positive points added" value={`+${totalPositive}`} tone="positive" />
        <Row label="Negative points deducted" value={totalNegative} tone="negative" />
        <Row label="Final Raksha Score" value={`${finalScore} / 100`} bold colorClass={ZONE_TEXT[zone]} />
      </div>

      {wasClamped && (
        <p className="text-xs text-ink-soft/80 mt-2">
          Raw total was <span className="font-mono">{rawScore}</span>, clamped to the 0–100 range.
        </p>
      )}
    </div>
  )
}
