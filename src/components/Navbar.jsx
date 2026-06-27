import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ShieldCheck, Menu, X } from 'lucide-react'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/report', label: 'Report a Spot' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/heatmap', label: 'Heatmap' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-night/95 backdrop-blur border-b border-white/5">
      <div className="container-page flex items-center justify-between h-16">
        <NavLink to="/" className="flex items-center gap-2 group" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-marigold text-night shadow-glow">
            <ShieldCheck size={20} strokeWidth={2.5} />
          </span>
          <span className="font-display font-bold text-lg text-paper tracking-tight">
            Raksha<span className="text-marigold">Rank</span>
          </span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/10 text-marigold' : 'text-paper/80 hover:text-paper hover:bg-white/5'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <NavLink
          to="/report"
          className="hidden md:inline-flex items-center rounded-full bg-marigold px-4 py-2 text-sm font-semibold text-night shadow-glow hover:bg-marigold-dark transition-colors"
        >
          Check Safety Score
        </NavLink>

        <button
          className="md:hidden text-paper p-2 -mr-2"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-white/5 px-4 pb-4 pt-2 flex flex-col gap-1 bg-night animate-fade-up">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-white/10 text-marigold' : 'text-paper/80'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
