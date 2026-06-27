import React, { useState } from 'react'
import { Copy, ClipboardCheck } from 'lucide-react'

export default function CopyButton({ text, label = 'Copy Complaint', className = '' }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy(e) {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard API can be blocked in some embedded browsers — fail quietly.
    }
  }

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-full border border-night/15 px-3.5 py-1.5 text-xs font-semibold text-ink hover:border-marigold hover:text-marigold-dark transition-colors ${className}`}
    >
      {copied ? <ClipboardCheck size={14} className="text-zone-safer" /> : <Copy size={14} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}
