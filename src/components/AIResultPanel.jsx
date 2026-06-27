import React from 'react'
import {
  Building2,
  Languages,
  ListChecks,
  ShieldAlert,
  ShieldCheck,
  Timer,
  Lightbulb,
  Hash,
  CalendarClock,
  Info,
} from 'lucide-react'
import ScoreGauge from './ScoreGauge.jsx'
import { ZoneBadge, UrgencyBadge } from './Badges.jsx'
import CopyButton from './CopyButton.jsx'
import PoweredByBadge from './PoweredByBadge.jsx'
import EmergencyBanner from './EmergencyBanner.jsx'
import ScoreBreakdown from './ScoreBreakdown.jsx'
import { titleCaseLocation } from '../lib/textFormat.js'

export default function AIResultPanel({ report }) {
  const { ai, score, location, time, id, createdAt } = report
  const formattedLocation = titleCaseLocation(location)
  const generatedAt = new Date(createdAt)

  return (
    <div className="rounded-3xl bg-white border border-night/10 shadow-card overflow-hidden animate-fade-up">
      {/* Header band */}
      <div className="bg-night px-6 py-6 md:px-8 md:py-8 text-paper grid md:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <p className="text-xs uppercase tracking-wide text-marigold font-semibold">AI Safety Analysis</p>
            <PoweredByBadge variant="dark" />
          </div>
          <h2 className="font-display text-2xl font-bold leading-snug">{ai.title}</h2>
          <p className="text-paper/70 text-sm mt-1">
            {formattedLocation} · {time}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-paper/50 font-mono">
            <span className="flex items-center gap-1">
              <Hash size={11} /> {id}
            </span>
            <span className="flex items-center gap-1">
              <CalendarClock size={11} />
              {generatedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} ·{' '}
              {generatedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <ZoneBadge zone={score.zone} />
            <UrgencyBadge urgency={ai.urgency} />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              {ai.category}
            </span>
          </div>
        </div>
        <ScoreGauge score={score.score} size="md" theme="dark" />
      </div>

      <div className="px-6 pt-6 md:px-8">
        <EmergencyBanner />
      </div>

      <div className="p-6 md:p-8 grid md:grid-cols-2 gap-6">
        {/* Score reasoning */}
        <div className="rounded-2xl bg-paper-dim p-5">
          <h3 className="flex items-center gap-2 font-display font-semibold text-ink text-sm mb-2">
            <Lightbulb size={16} className="text-marigold-dark" /> Why this score?
          </h3>
          <p className="text-sm text-ink-soft leading-relaxed">{ai.scoreReason}</p>
        </div>

        {/* Score breakdown — base / positive / negative / final, fully transparent */}
        <ScoreBreakdown score={score} />

        {/* Positive factors */}
        <div>
          <h3 className="flex items-center gap-2 font-display font-semibold text-ink text-sm mb-3">
            <ShieldCheck size={16} className="text-zone-safer" /> Positive safety factors
          </h3>
          {ai.positiveFactors?.length ? (
            <ul className="flex flex-wrap gap-2">
              {ai.positiveFactors.map((f) => (
                <li key={f} className="text-xs rounded-full bg-zone-safer-bg text-zone-safer px-3 py-1 font-medium">
                  {f}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-ink-soft">None reported nearby.</p>
          )}
        </div>

        {/* Risk factors */}
        <div>
          <h3 className="flex items-center gap-2 font-display font-semibold text-ink text-sm mb-3">
            <ShieldAlert size={16} className="text-zone-unsafe" /> Risk factors
          </h3>
          {ai.riskFactors?.length ? (
            <ul className="flex flex-wrap gap-2">
              {ai.riskFactors.map((f) => (
                <li key={f} className="text-xs rounded-full bg-zone-unsafe-bg text-zone-unsafe px-3 py-1 font-medium">
                  {f}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-ink-soft">None reported nearby.</p>
          )}
        </div>

        {/* Department + action + resolution */}
        <div className="rounded-2xl border border-night/10 p-5">
          <h3 className="flex items-center gap-2 font-display font-semibold text-ink text-sm mb-2">
            <Building2 size={16} className="text-sindoor" /> Responsible department
          </h3>
          <p className="text-sm text-ink-soft leading-relaxed">{ai.department}</p>
        </div>
        <div className="rounded-2xl border border-night/10 p-5">
          <h3 className="flex items-center gap-2 font-display font-semibold text-ink text-sm mb-2">
            <Timer size={16} className="text-sindoor" /> Estimated resolution time
          </h3>
          <p className="text-sm text-ink-soft leading-relaxed">{ai.estimatedResolutionTime}</p>
        </div>

        <div className="md:col-span-2 rounded-2xl border border-marigold/30 bg-marigold/5 p-5">
          <h3 className="flex items-center gap-2 font-display font-semibold text-ink text-sm mb-2">
            <ListChecks size={16} className="text-marigold-dark" /> Suggested action
          </h3>
          <p className="text-sm text-ink-soft leading-relaxed">{ai.suggestedAction}</p>
        </div>

        {/* Safety tips */}
        <div className="md:col-span-2">
          <h3 className="flex items-center gap-2 font-display font-semibold text-ink text-sm mb-3">
            <ShieldCheck size={16} className="text-zone-moderate" /> Personal safety tips
          </h3>
          <ul className="grid sm:grid-cols-2 gap-2">
            {ai.safetyTips?.map((tip, i) => (
              <li key={i} className="text-sm text-ink-soft flex items-start gap-2 bg-paper-dim rounded-xl p-3">
                <span className="font-mono text-marigold-dark text-xs mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Complaints */}
        <div className="md:col-span-2 grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-night/10 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center gap-2 font-display font-semibold text-ink text-sm">
                <Languages size={16} className="text-sindoor" /> Complaint — English
              </h3>
              <CopyButton text={ai.complaintEnglish} label="Copy Complaint" />
            </div>
            {ai.complaintSubjectEnglish && (
              <p className="text-xs font-semibold text-ink bg-paper-dim rounded-lg px-3 py-2 mb-3 leading-relaxed">
                Subject: {ai.complaintSubjectEnglish}
              </p>
            )}
            <pre className="whitespace-pre-wrap text-xs text-ink-soft font-body leading-relaxed flex-1">
              {ai.complaintEnglish}
            </pre>
          </div>
          <div className="rounded-2xl border border-night/10 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center gap-2 font-display font-semibold text-ink text-sm">
                <Languages size={16} className="text-sindoor" /> शिकायत — हिंदी
              </h3>
              <CopyButton text={ai.complaintHindi} label="Copy Complaint" />
            </div>
            {ai.complaintSubjectHindi && (
              <p className="text-xs font-semibold text-ink bg-paper-dim rounded-lg px-3 py-2 mb-3 leading-relaxed">
                विषय: {ai.complaintSubjectHindi}
              </p>
            )}
            <pre className="whitespace-pre-wrap text-xs text-ink-soft font-body leading-relaxed flex-1">
              {ai.complaintHindi}
            </pre>
          </div>
        </div>

        {/* Responsible AI mini-note */}
        <div className="md:col-span-2 flex items-start gap-2.5 text-xs text-ink-soft/80 bg-paper-dim rounded-xl p-4">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <p>
            This analysis is AI-assisted and based only on the factors you selected — RakshaRank does not access
            real CCTV feeds, identify people, or track anyone in real time. See the Responsible AI section on the
            Home page for details.
          </p>
        </div>
      </div>
    </div>
  )
}
