import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, LayoutDashboard, Map } from 'lucide-react'
import ReportForm from '../components/ReportForm.jsx'
import AIResultPanel from '../components/AIResultPanel.jsx'
import EmergencyBanner from '../components/EmergencyBanner.jsx'
import { calculateRakshaScore } from '../lib/rakshaScore.js'
import { analyzeSafetyIssueWithGemini } from '../lib/geminiService.js'
import { saveReport, makeReportId } from '../lib/storage.js'

export default function ReportPage() {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)

  async function handleAnalyze({ issueText, location, time, factors }) {
    setLoading(true)
    setReport(null)

    const score = calculateRakshaScore(factors)
    const scoreBreakdown = {
      baseScore: score.baseScore,
      positivePoints: score.totalPositive,
      negativePoints: score.totalNegative,
      finalScore: score.score,
    }
    const ai = await analyzeSafetyIssueWithGemini(issueText, location, time, factors, score, scoreBreakdown)

    const newReport = {
      id: makeReportId(),
      issueText,
      location,
      time,
      factors,
      status: 'Reported',
      createdAt: new Date().toISOString(),
      score,
      ai,
    }

    saveReport(newReport)
    setReport(newReport)
    setLoading(false)
  }

  return (
    <div className="container-page py-12">
      <div className="max-w-2xl mb-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-sindoor/10 text-sindoor px-3 py-1 text-xs font-semibold mb-4">
          Report an unsafe spot
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink">
          Tell us what you saw — we'll score it and draft the complaint.
        </h1>
        <p className="mt-3 text-ink-soft leading-relaxed">
          Describe the spot honestly and tick every safety factor you actually observe. The more accurate the
          factors, the more useful the Raksha Score and the AI's recommendations will be.
        </p>
      </div>

      <div className="max-w-2xl mb-10">
        <EmergencyBanner />
      </div>

      <div className="grid lg:grid-cols-[1fr] gap-10">
        <div className="bg-white rounded-3xl border border-night/10 shadow-soft p-6 md:p-8">
          <ReportForm onAnalyze={handleAnalyze} loading={loading} />
        </div>

        {report && (
          <div className="space-y-4">
            <AIResultPanel report={report} />
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 text-sm text-zone-safer font-medium">
                <CheckCircle2 size={16} /> Saved to your device and added to the community dashboard.
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-night px-5 py-2.5 text-sm font-semibold text-paper hover:bg-night-light transition-colors"
              >
                <LayoutDashboard size={16} /> View Community Dashboard
              </Link>
              <Link
                to="/heatmap"
                className="inline-flex items-center gap-2 rounded-full border border-night/15 px-5 py-2.5 text-sm font-semibold text-ink hover:border-marigold transition-colors"
              >
                <Map size={16} /> View Safety Heatmap
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
