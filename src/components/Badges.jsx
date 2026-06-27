import React from 'react'
import { ShieldCheck, ShieldAlert, ShieldHalf, ShieldX, Clock, Loader2, CheckCircle2 } from 'lucide-react'

const ZONE_STYLES = {
  Safer: { bg: 'bg-zone-safer-bg', text: 'text-zone-safer', icon: ShieldCheck },
  Moderate: { bg: 'bg-zone-moderate-bg', text: 'text-zone-moderate', icon: ShieldHalf },
  Risky: { bg: 'bg-zone-risky-bg', text: 'text-zone-risky', icon: ShieldAlert },
  Unsafe: { bg: 'bg-zone-unsafe-bg', text: 'text-zone-unsafe', icon: ShieldX },
}

export function ZoneBadge({ zone, className = '' }) {
  const style = ZONE_STYLES[zone] || ZONE_STYLES.Moderate
  const Icon = style.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.bg} ${style.text} ${className}`}
    >
      <Icon size={14} strokeWidth={2.5} />
      {zone} Zone
    </span>
  )
}

const URGENCY_STYLES = {
  Low: 'bg-zone-safer-bg text-zone-safer',
  Medium: 'bg-zone-moderate-bg text-zone-moderate',
  High: 'bg-zone-risky-bg text-zone-risky',
  Critical: 'bg-zone-unsafe-bg text-zone-unsafe',
}

export function UrgencyBadge({ urgency, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${URGENCY_STYLES[urgency] || URGENCY_STYLES.Medium} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {urgency} urgency
    </span>
  )
}

const STATUS_STYLES = {
  Reported: { cls: 'bg-night/5 text-night', icon: Clock },
  'In Progress': { cls: 'bg-marigold-light/60 text-marigold-dark', icon: Loader2 },
  Resolved: { cls: 'bg-zone-safer-bg text-zone-safer', icon: CheckCircle2 },
}

export function StatusBadge({ status, className = '' }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Reported
  const Icon = style.icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.cls} ${className}`}>
      <Icon size={13} strokeWidth={2.5} />
      {status}
    </span>
  )
}
