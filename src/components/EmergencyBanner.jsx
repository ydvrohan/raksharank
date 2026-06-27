import React from 'react'
import { PhoneCall } from 'lucide-react'

/**
 * The mandatory emergency disclaimer. Used on the Report page and the
 * AI Result panel so it's visible exactly where someone might be reporting
 * — or reading about — a genuinely dangerous situation.
 */
export default function EmergencyBanner({ className = '' }) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-2xl border border-zone-unsafe/30 bg-zone-unsafe-bg px-5 py-4 text-sm text-zone-unsafe ${className}`}
    >
      <PhoneCall size={18} className="flex-shrink-0 mt-0.5" />
      <p className="leading-relaxed">
        <strong>RakshaRank does not replace emergency services.</strong> If you are in immediate danger, call{' '}
        <strong>112</strong> or contact your local police immediately.
      </p>
    </div>
  )
}
