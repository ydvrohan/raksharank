// ─────────────────────────────────────────────────────────────────────────
// TEXT FORMATTING UTILITIES
// Small, shared formatters so location strings look consistent everywhere
// (Heatmap tiles, complaint letters, report cards) without mutating the
// raw value the user actually typed (we only format at display/use time).
// ─────────────────────────────────────────────────────────────────────────

// Common Indian location/brand acronyms that should stay fully uppercase
// instead of being title-cased (e.g. "sbi atm" → "SBI ATM", not "Sbi Atm").
const KNOWN_ACRONYMS = new Set([
  'ATM', 'SBI', 'HDFC', 'ICICI', 'AXIS', 'PNB', 'BOI', 'RWA', 'CCTV',
  'NH', 'MG', 'BHK', 'PVR', 'DLF', 'GST', 'FCI', 'BHEL', 'IT', 'GRP',
])

/**
 * titleCaseLocation — "near sbi atm, sector 14" → "Near SBI ATM, Sector 14"
 * Keeps known acronyms uppercase, title-cases everything else, and leaves
 * punctuation (commas, hyphens) attached to the word untouched.
 */
export function titleCaseLocation(input) {
  if (!input || typeof input !== 'string') return input
  return input
    .trim()
    .split(/\s+/)
    .map((word) => {
      const alphaOnly = word.replace(/[^A-Za-z]/g, '')
      if (alphaOnly && KNOWN_ACRONYMS.has(alphaOnly.toUpperCase())) {
        return word.toUpperCase()
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

export function truncate(text, maxLength = 60) {
  if (!text) return text
  return text.length > maxLength ? `${text.slice(0, maxLength - 3).trim()}...` : text
}

/**
 * stripLeadingNear — "Near College Road, Jalandhar" → "College Road, Jalandhar"
 * Users very often type locations as "near X" (e.g. "near sbi atm"). That
 * reads fine as a display label (titleCaseLocation keeps "Near"), but it
 * must be stripped before slotting into a sentence that already supplies
 * its own "near" / "के पास" — otherwise you get "near Near X".
 */
export function stripLeadingNear(formattedLocation) {
  if (!formattedLocation) return formattedLocation
  return formattedLocation.replace(/^near\s+/i, '').trim()
}
