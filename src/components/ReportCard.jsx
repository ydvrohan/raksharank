import React, { useState } from 'react'
import { MapPin, Clock3, Tag, ChevronDown, Trash2 } from 'lucide-react'
import { ZoneBadge, UrgencyBadge } from './Badges.jsx'
import CopyButton from './CopyButton.jsx'
import { titleCaseLocation } from '../lib/textFormat.js'

const STATUS_OPTIONS = ['Reported', 'In Progress', 'Resolved']

const STATUS_SELECT_STYLES = {
  Reported: 'bg-night/5 text-night',
  'In Progress': 'bg-marigold-light/60 text-marigold-dark',
  Resolved: 'bg-zone-safer-bg text-zone-safer',
}

const ZONE_RING = {
  Safer: 'ring-zone-safer/30',
  Moderate: 'ring-zone-moderate/30',
  Risky: 'ring-zone-risky/30',
  Unsafe: 'ring-zone-unsafe/30',
}

const ZONE_NUM_COLOR = {
  Safer: 'text-zone-safer',
  Moderate: 'text-zone-moderate',
  Risky: 'text-zone-risky',
  Unsafe: 'text-zone-unsafe',
}

export default function ReportCard({ report, onStatusChange, onDelete }) {
  const { location, status, createdAt, score, ai } = report
  const date = new Date(createdAt)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function handleDeleteClick() {
    if (confirmingDelete) {
      onDelete?.(report.id)
    } else {
      setConfirmingDelete(true)
      setTimeout(() => setConfirmingDelete(false), 3000)
    }
  }

  return (
    <div
      className={`rounded-2xl bg-white border border-night/5 shadow-soft hover:shadow-card transition-shadow p-5 flex flex-col gap-4 ring-1 ${ZONE_RING[score.zone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-ink text-base leading-snug line-clamp-2">{ai.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft min-w-0">
            <MapPin size={14} className="flex-shrink-0 text-sindoor" />
            <span className="truncate">{titleCaseLocation(location)}</span>
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`font-mono text-2xl font-bold leading-none ${ZONE_NUM_COLOR[score.zone]}`}>{score.score}</div>
          <div className="text-[10px] uppercase tracking-wide text-ink-soft/70">/100</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <ZoneBadge zone={score.zone} />
        <UrgencyBadge urgency={ai.urgency} />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-night/5 px-3 py-1 text-xs font-medium text-ink-soft">
          <Tag size={12} /> {ai.category}
        </span>
      </div>

      {report.ai.riskFactors?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {report.ai.riskFactors.slice(0, 4).map((f) => (
            <span key={f} className="text-[11px] rounded-md bg-zone-unsafe-bg text-zone-unsafe px-2 py-0.5">
              {f}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-ink-soft">
        <span className="flex items-center gap-1.5">
          <Clock3 size={13} />
          {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ·{' '}
          {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>

        <div className="relative">
          <select
            value={status}
            onChange={(e) => onStatusChange?.(report.id, e.target.value)}
            aria-label="Update report status"
            className={`appearance-none cursor-pointer rounded-full pl-3 pr-7 py-1 text-xs font-semibold border-0 ${STATUS_SELECT_STYLES[status]}`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-60" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-night/5">
        <CopyButton text={ai.complaintEnglish} label="Copy Complaint" />
        <button
          type="button"
          onClick={handleDeleteClick}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            confirmingDelete
              ? 'bg-zone-unsafe text-white'
              : 'border border-night/15 text-ink-soft hover:border-zone-unsafe hover:text-zone-unsafe'
          }`}
        >
          <Trash2 size={14} />
          {confirmingDelete ? 'Confirm delete?' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
