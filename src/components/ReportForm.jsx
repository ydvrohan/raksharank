import React, { useState } from 'react'
import { Sparkles, MapPin, Clock3, FileText, Loader2 } from 'lucide-react'
import { POSITIVE_FACTORS, NEGATIVE_FACTORS, emptyFactorState } from '../lib/factors.js'

const TIME_PRESETS = ['Morning', 'Afternoon', 'Evening', 'Late night (9 PM–12 AM)', 'After midnight', 'All hours']

export default function ReportForm({ onAnalyze, loading }) {
  const [issueText, setIssueText] = useState('')
  const [location, setLocation] = useState('')
  const [time, setTime] = useState('')
  const [factors, setFactors] = useState(emptyFactorState())
  const [error, setError] = useState('')

  function toggleFactor(key) {
    setFactors((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!issueText.trim() || !location.trim() || !time.trim()) {
      setError('Please fill in the issue description, location, and time of issue.')
      return
    }
    setError('')
    onAnalyze({ issueText: issueText.trim(), location: location.trim(), time: time.trim(), factors })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-ink mb-2" htmlFor="issueText">
            <FileText size={15} className="text-sindoor" /> Issue description
          </label>
          <textarea
            id="issueText"
            value={issueText}
            onChange={(e) => setIssueText(e.target.value)}
            rows={3}
            placeholder="e.g. The lane behind the market has no streetlight and feels deserted after sunset."
            className="w-full rounded-xl border border-night/10 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-soft/50 focus:border-marigold outline-none resize-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink mb-2" htmlFor="location">
            <MapPin size={15} className="text-sindoor" /> Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. MG Road Bus Stop, Sector 14"
            className="w-full rounded-xl border border-night/10 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-soft/50 focus:border-marigold outline-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink mb-2" htmlFor="time">
            <Clock3 size={15} className="text-sindoor" /> Time of issue
          </label>
          <input
            id="time"
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="e.g. 9 PM – 11 PM"
            className="w-full rounded-xl border border-night/10 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-soft/50 focus:border-marigold outline-none"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {TIME_PRESETS.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setTime(p)}
                className="text-[11px] rounded-full border border-night/10 px-2.5 py-1 text-ink-soft hover:border-marigold hover:text-marigold-dark transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <FactorGroup
          title="Positive safety factors nearby"
          subtitle="Tick what makes this spot feel safer"
          tone="positive"
          factors={POSITIVE_FACTORS}
          selected={factors}
          onToggle={toggleFactor}
        />
        <FactorGroup
          title="Risk factors nearby"
          subtitle="Tick what makes this spot feel unsafe"
          tone="negative"
          factors={NEGATIVE_FACTORS}
          selected={factors}
          onToggle={toggleFactor}
        />
      </div>

      {error && <p className="text-sm text-zone-unsafe font-medium">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-night px-7 py-3.5 font-semibold text-paper shadow-card hover:bg-night-light transition-colors disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Analyzing with AI…
          </>
        ) : (
          <>
            <Sparkles size={18} className="text-marigold" /> Analyze with AI
          </>
        )}
      </button>
    </form>
  )
}

function FactorGroup({ title, subtitle, tone, factors, selected, onToggle }) {
  const activeStyle =
    tone === 'positive'
      ? 'border-zone-safer bg-zone-safer-bg text-zone-safer'
      : 'border-zone-unsafe bg-zone-unsafe-bg text-zone-unsafe'

  return (
    <fieldset className="rounded-2xl border border-night/10 p-5 bg-white">
      <legend className="px-1">
        <p className="font-display font-semibold text-ink text-sm">{title}</p>
        <p className="text-xs text-ink-soft mb-3">{subtitle}</p>
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {factors.map((f) => {
          const checked = !!selected[f.key]
          return (
            <label
              key={f.key}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium cursor-pointer transition-colors ${
                checked ? activeStyle : 'border-night/10 text-ink-soft hover:border-night/20'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(f.key)}
                className="accent-current h-3.5 w-3.5"
              />
              {f.label}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
