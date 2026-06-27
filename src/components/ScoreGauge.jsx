import React from 'react'

// ─────────────────────────────────────────────────────────────────────────
// SCORE GAUGE — "the Raksha Meter"
// A semicircular dial styled after the fare meters seen on Indian
// auto-rickshaws and old electricity meters — a deliberately hyperlocal,
// street-level visual metaphor for a hyperlocal street-safety score.
// Reused in the Hero, the AI Result panel, and (small) on Report Cards.
// ─────────────────────────────────────────────────────────────────────────

const ZONES = [
  { from: 0, to: 40, color: '#D7263D' },
  { from: 40, to: 60, color: '#F2722F' },
  { from: 60, to: 80, color: '#E6B400' },
  { from: 80, to: 100, color: '#0E9F6E' },
]

function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

function arcBand(cx, cy, rOuter, rInner, scoreStart, scoreEnd, color, key) {
  const aStart = 180 - (scoreStart / 100) * 180
  const aEnd = 180 - (scoreEnd / 100) * 180
  const so = polar(cx, cy, rOuter, aStart)
  const eo = polar(cx, cy, rOuter, aEnd)
  const si = polar(cx, cy, rInner, aEnd)
  const ei = polar(cx, cy, rInner, aStart)
  const d = `M ${so.x.toFixed(2)} ${so.y.toFixed(2)} A ${rOuter} ${rOuter} 0 0 1 ${eo.x.toFixed(2)} ${eo.y.toFixed(2)} L ${si.x.toFixed(2)} ${si.y.toFixed(2)} A ${rInner} ${rInner} 0 0 0 ${ei.x.toFixed(2)} ${ei.y.toFixed(2)} Z`
  return <path key={key} d={d} fill={color} />
}

const SIZES = {
  sm: { viewW: 160, viewH: 110, cx: 80, cy: 84, rOuter: 68, rInner: 52, fontSize: 26, needleLen: 56 },
  md: { viewW: 220, viewH: 150, cx: 110, cy: 115, rOuter: 95, rInner: 76, fontSize: 36, needleLen: 80 },
  lg: { viewW: 280, viewH: 190, cx: 140, cy: 146, rOuter: 122, rInner: 96, fontSize: 46, needleLen: 102 },
}

export default function ScoreGauge({ score = 0, size = 'md', label = true, theme = 'light', className = '' }) {
  const clamped = Math.max(0, Math.min(100, score))
  const cfg = SIZES[size] || SIZES.md
  const needleAngle = 180 - (clamped / 100) * 180
  const needleTip = polar(cfg.cx, cfg.cy, cfg.needleLen, needleAngle)
  // Needle/pivot/number need to flip to a light colour on dark surfaces
  // (e.g. the AI Result panel's night-blue header) or they vanish.
  const inkColor = theme === 'dark' ? '#FFF9F2' : '#12173A'
  const pivotAccent = theme === 'dark' ? '#12173A' : '#F2A93B'
  const labelColor = theme === 'dark' ? 'text-paper/60' : 'text-ink-soft'

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        viewBox={`0 0 ${cfg.viewW} ${cfg.viewH}`}
        className="w-full max-w-[280px]"
        role="img"
        aria-label={`Raksha Score ${clamped} out of 100`}
      >
        {ZONES.map((z, i) => arcBand(cfg.cx, cfg.cy, cfg.rOuter, cfg.rInner, z.from, z.to, z.color, i))}
        {/* tick marks at 0/40/60/80/100 */}
        {[0, 40, 60, 80, 100].map((tick) => {
          const a = 180 - (tick / 100) * 180
          const inner = polar(cfg.cx, cfg.cy, cfg.rInner - 6, a)
          const outer = polar(cfg.cx, cfg.cy, cfg.rOuter + 4, a)
          return (
            <line
              key={tick}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#FFF9F2"
              strokeWidth="2"
            />
          )
        })}
        <line
          x1={cfg.cx}
          y1={cfg.cy}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke={inkColor}
          strokeWidth="4"
          strokeLinecap="round"
          style={{ transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
        <circle cx={cfg.cx} cy={cfg.cy} r="7" fill={inkColor} />
        <circle cx={cfg.cx} cy={cfg.cy} r="3" fill={pivotAccent} />
        <text
          x={cfg.cx}
          y={cfg.cy - cfg.fontSize * 0.55}
          textAnchor="middle"
          fontSize={cfg.fontSize}
          fontWeight="700"
          fontFamily="'JetBrains Mono', monospace"
          fill={inkColor}
        >
          {clamped}
        </text>
      </svg>
      {label && (
        <p className={`font-mono text-[11px] tracking-widest uppercase -mt-1 ${labelColor}`}>
          Raksha Score · /100
        </p>
      )}
    </div>
  )
}
