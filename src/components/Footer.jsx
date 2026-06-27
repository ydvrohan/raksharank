import React from 'react'
import { ShieldCheck, Phone, Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-night text-paper/70 mt-16">
      <div className="container-page py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-marigold text-night">
              <ShieldCheck size={16} strokeWidth={2.5} />
            </span>
            <span className="font-display font-bold text-paper">
              Raksha<span className="text-marigold">Rank</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">
            A hyperlocal women-safety scoring platform, built by the community, for the community — one street at a time.
          </p>
        </div>

        <div>
          <h4 className="font-display text-paper font-semibold mb-3 text-sm uppercase tracking-wide">Emergency numbers</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Phone size={14} className="text-marigold" /> Women Helpline — 1091</li>
            <li className="flex items-center gap-2"><Phone size={14} className="text-marigold" /> Emergency — 112</li>
            <li className="flex items-center gap-2"><Phone size={14} className="text-marigold" /> Police — 100</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-paper font-semibold mb-3 text-sm uppercase tracking-wide">Important disclaimer</h4>
          <p className="text-sm leading-relaxed">
            RakshaRank scores are generated from <strong className="text-paper">community-reported, hyperlocal safety
            factors</strong> and AI analysis. It does not access any real CCTV feed, live police data, or government
            database. Always use your own judgement and contact local authorities in an emergency.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-xs text-paper/50 flex items-center justify-between container-page">
        <span>© {new Date().getFullYear()} RakshaRank — built for Community Hero: Hyperlocal Problem Solver</span>
        <span className="hidden sm:flex items-center gap-1"><Github size={12} /> Hackathon MVP</span>
      </div>
    </footer>
  )
}
