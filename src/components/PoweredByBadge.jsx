import React from 'react'
import { Sparkles } from 'lucide-react'

/**
 * "Powered by Google AI Studio + Gemini" badge.
 * variant="dark"  → for use on night-blue surfaces (Hero, Result header)
 * variant="light" → for use on white/paper surfaces
 */
export default function PoweredByBadge({ variant = 'light', className = '' }) {
  const styles =
    variant === 'dark'
      ? 'bg-white/10 text-paper border-white/15'
      : 'bg-night/5 text-ink-soft border-night/10'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${styles} ${className}`}
    >
      <Sparkles size={13} className="text-marigold" />
      Powered by Google AI Studio + Gemini
    </span>
  )
}
