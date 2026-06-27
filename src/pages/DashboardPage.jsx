import React, { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import ReportCard from '../components/ReportCard.jsx'
import { getReports, updateReportStatus, deleteReport } from '../lib/storage.js'

// "Critical" is an urgency level, not a zone — selecting it filters across
// all zones for the most time-sensitive reports, as requested.
const ZONE_OR_URGENCY_FILTERS = ['All', 'Safer', 'Moderate', 'Risky', 'Unsafe', 'Critical']
const STATUS_FILTERS = ['All', 'Reported', 'In Progress', 'Resolved']

const FILTER_PILL_STYLES = {
  All: 'data-[active=true]:bg-night data-[active=true]:text-paper',
  Safer: 'data-[active=true]:bg-zone-safer data-[active=true]:text-white',
  Moderate: 'data-[active=true]:bg-zone-moderate data-[active=true]:text-night',
  Risky: 'data-[active=true]:bg-zone-risky data-[active=true]:text-white',
  Unsafe: 'data-[active=true]:bg-zone-unsafe data-[active=true]:text-white',
  Critical: 'data-[active=true]:bg-sindoor data-[active=true]:text-white',
}

export default function DashboardPage() {
  const [reports, setReports] = useState([])
  const [zoneFilter, setZoneFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setReports(getReports())
  }, [])

  function handleStatusChange(id, status) {
    setReports(updateReportStatus(id, status))
  }

  function handleDelete(id) {
    setReports(deleteReport(id))
  }

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (zoneFilter === 'Critical' && r.ai.urgency !== 'Critical') return false
      if (zoneFilter !== 'All' && zoneFilter !== 'Critical' && r.score.zone !== zoneFilter) return false
      if (statusFilter !== 'All' && r.status !== statusFilter) return false
      if (search && !r.location.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [reports, zoneFilter, statusFilter, search])

  const stats = useMemo(() => {
    const total = reports.length
    const avg = total ? Math.round(reports.reduce((s, r) => s + r.score.score, 0) / total) : 0
    const unsafe = reports.filter((r) => r.score.zone === 'Unsafe' || r.score.zone === 'Risky').length
    const resolved = reports.filter((r) => r.status === 'Resolved').length
    return { total, avg, unsafe, resolved }
  }, [reports])

  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink">Community Safety Dashboard</h1>
        <p className="mt-2 text-ink-soft">Every spot reported by the community, scored and tracked in one place.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatTile label="Total reports" value={stats.total} />
        <StatTile label="Avg. Raksha Score" value={stats.avg} />
        <StatTile label="Risky / Unsafe spots" value={stats.unsafe} accent="text-zone-unsafe" />
        <StatTile label="Resolved" value={stats.resolved} accent="text-zone-safer" />
      </div>

      <div className="flex flex-col gap-4 mb-8 bg-white rounded-2xl border border-night/10 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by location…"
              className="w-full rounded-xl border border-night/10 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-marigold"
            />
          </div>
          <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={STATUS_FILTERS} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal size={14} className="text-ink-soft/60" />
          {ZONE_OR_URGENCY_FILTERS.map((opt) => (
            <button
              key={opt}
              type="button"
              data-active={zoneFilter === opt}
              onClick={() => setZoneFilter(opt)}
              className={`rounded-full border border-night/10 px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition-colors ${FILTER_PILL_STYLES[opt]}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-night/15 p-12 text-center text-ink-soft">
          No reports match these filters yet.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function StatTile({ label, value, accent = 'text-ink' }) {
  return (
    <div className="bg-white rounded-2xl border border-night/10 p-4">
      <p className={`font-mono text-2xl font-bold ${accent}`}>{value}</p>
      <p className="text-xs text-ink-soft mt-1">{label}</p>
    </div>
  )
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="rounded-xl border border-night/10 px-3 py-2.5 text-sm bg-white outline-none focus:border-marigold"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {label}: {opt}
          </option>
        ))}
      </select>
    </div>
  )
}
