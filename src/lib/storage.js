// ─────────────────────────────────────────────────────────────────────────
// LOCAL STORAGE LAYER
// RakshaRank is a hackathon MVP — there is no backend. Every submitted
// report is persisted to the browser's localStorage so it survives a
// page refresh. Swap this module for a real API client later without
// touching any component code.
// ─────────────────────────────────────────────────────────────────────────
import { SEED_REPORTS } from '../data/sampleReports.js'

const STORAGE_KEY = 'raksharank_reports_v1'

export function getReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      // First-ever visit: seed with sample community reports so the
      // Dashboard and Heatmap aren't empty for a first-time/demo user.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_REPORTS))
      return SEED_REPORTS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : SEED_REPORTS
  } catch (err) {
    console.error('RakshaRank: failed to read reports from localStorage', err)
    return SEED_REPORTS
  }
}

export function saveReport(report) {
  const reports = getReports()
  const updated = [report, ...reports]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function updateReportStatus(id, status) {
  const reports = getReports()
  const updated = reports.map((r) => (r.id === id ? { ...r, status } : r))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function deleteReport(id) {
  const reports = getReports()
  const updated = reports.filter((r) => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function clearAllReports() {
  localStorage.removeItem(STORAGE_KEY)
}

export function makeReportId() {
  return `RR-${Date.now().toString(36).toUpperCase()}`
}
