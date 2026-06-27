import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  MapPin,
  Sparkles,
  ClipboardList,
  Megaphone,
  LayoutDashboard,
  CheckCircle2,
  IndianRupee,
} from 'lucide-react'
import ScoreGauge from '../components/ScoreGauge.jsx'
import { ZoneBadge, UrgencyBadge } from '../components/Badges.jsx'
import PoweredByBadge from '../components/PoweredByBadge.jsx'
import ResponsibleAISection from '../components/ResponsibleAISection.jsx'

const STEPS = [
  {
    n: '01',
    icon: ClipboardList,
    title: 'Describe the spot',
    body: 'Note the issue, the exact location, the time it happens, and tick the nearby safety factors you can see.',
  },
  {
    n: '02',
    icon: Sparkles,
    title: 'AI analyses it',
    body: 'RakshaRank runs the Raksha Score engine and Gemini AI together to read the spot and explain the risk.',
  },
  {
    n: '03',
    icon: Megaphone,
    title: 'Get a ready complaint',
    body: 'Receive a Raksha Score, the responsible department, and a complaint drafted in Hindi and English.',
  },
  {
    n: '04',
    icon: LayoutDashboard,
    title: 'Track it with everyone',
    body: 'Your report joins the community Dashboard and Heatmap so the whole locality can see and act on it.',
  },
]

const TRUST_POINTS = [
  'No paid services — built fully on free, open tooling',
  'No real CCTV or police database access — purely community + AI reasoning',
  'Every report stays on your device via local storage',
]

export default function HomePage() {
  return (
    <div>
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="bg-night bg-dusk-grid relative overflow-hidden">
        <div className="container-page py-16 md:py-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center relative">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-xs font-medium text-marigold mb-6">
              <MapPin size={13} /> Community Hero · Hyperlocal Problem Solver
            </span>
            <div className="mb-4">
              <PoweredByBadge variant="dark" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-paper leading-[1.08] tracking-tight">
              Know the safety of <span className="text-marigold">every street</span> before you go.
            </h1>
            <p className="mt-6 text-lg text-paper/75 max-w-xl leading-relaxed">
              RakshaRank turns what your neighbourhood already knows — a broken streetlight, a deserted lane, a
              missing guard — into a clear safety score for every street, ATM, bus stop, and society, so women can
              decide before they step out, not after.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 rounded-full bg-marigold px-6 py-3.5 font-semibold text-night shadow-glow hover:bg-marigold-dark transition-colors"
              >
                Check Safety Score <ArrowRight size={18} />
              </Link>
              <Link
                to="/heatmap"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 font-semibold text-paper hover:bg-white/5 transition-colors"
              >
                View Safety Heatmap
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              <div>
                <dt className="font-mono text-2xl font-bold text-marigold">28+</dt>
                <dd className="text-xs text-paper/60 mt-1">spot types covered</dd>
              </div>
              <div>
                <dt className="font-mono text-2xl font-bold text-marigold">16</dt>
                <dd className="text-xs text-paper/60 mt-1">safety factors scored</dd>
              </div>
              <div>
                <dt className="font-mono text-2xl font-bold text-marigold flex items-center gap-0.5"><IndianRupee size={18}/>0</dt>
                <dd className="text-xs text-paper/60 mt-1">cost — no paid services</dd>
              </div>
            </dl>
          </div>

          {/* Signature element: a live sample Raksha Meter reading */}
          <div className="animate-fade-up [animation-delay:150ms] flex justify-center lg:justify-end">
            <div className="bg-paper rounded-3xl p-6 w-full max-w-sm shadow-card border border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-1">Sample analysis</p>
              <p className="font-display font-semibold text-ink mb-4">Subhash Underpass, Sector 14</p>
              <ScoreGauge score={42} size="md" />
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                <ZoneBadge zone="Risky" />
                <UrgencyBadge urgency="High" />
              </div>
              <p className="text-xs text-ink-soft mt-4 leading-relaxed">
                Pulled down by a broken streetlight and no visible police patrolling — boosted slightly by open
                shops nearby.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── EXPLAINER ───────────────────────── */}
      <section className="container-page py-16">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold text-ink">What RakshaRank actually does</h2>
          <p className="mt-4 text-ink-soft leading-relaxed">
            Think of it as a crowd-sourced safety meter for your locality. Anyone can report a spot — a dark lane,
            an isolated ATM, a bus stop with no patrolling — by ticking the safety factors they actually observe.
            RakshaRank's scoring engine turns that into a transparent <strong className="text-ink">Raksha Score</strong>{' '}
            out of 100, and Google's Gemini AI explains the risk, names the department responsible, and drafts a
            ready-to-send complaint in Hindi and English. No app installs, no GPS tracking, no paid map service —
            just what the street already tells you.
          </p>
        </div>
      </section>

      {/* ───────────────────────── HOW IT WORKS ───────────────────────── */}
      <section className="bg-paper-dim py-16">
        <div className="container-page">
          <h2 className="font-display text-3xl font-bold text-ink mb-2">How it works</h2>
          <p className="text-ink-soft mb-10">Four steps, from a worried walk to a tracked complaint.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step) => (
              <div key={step.n} className="bg-white rounded-2xl p-6 shadow-soft border border-night/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-night/5 text-night">
                    <step.icon size={18} />
                  </span>
                  <span className="font-mono text-sm text-ink-soft/50">{step.n}</span>
                </div>
                <h3 className="font-display font-semibold text-ink mb-1.5">{step.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── TRUST / MVP DISCLAIMER ───────────────────────── */}
      <section className="container-page py-16">
        <div className="rounded-3xl bg-night text-paper p-8 md:p-10 grid md:grid-cols-[1fr_1.2fr] gap-8">
          <div>
            <h2 className="font-display text-2xl font-bold mb-2">Built honestly, for a hackathon — and beyond</h2>
            <p className="text-paper/70 text-sm leading-relaxed">
              RakshaRank is an MVP. It does not claim live CCTV access or official police data — its score comes
              entirely from hyperlocal, user-reported factors plus AI reasoning on top of them.
            </p>
          </div>
          <ul className="space-y-3">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-paper/85">
                <CheckCircle2 size={18} className="text-marigold flex-shrink-0 mt-0.5" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────────────────── RESPONSIBLE AI ───────────────────────── */}
      <ResponsibleAISection />
    </div>
  )
}
