import React from 'react'
import { ScanFace, Video, MapPinOff, BrainCircuit, PhoneCall } from 'lucide-react'

const POINTS = [
  { icon: ScanFace, text: 'RakshaRank does not identify people.' },
  { icon: Video, text: 'RakshaRank does not access real CCTV feeds.' },
  { icon: MapPinOff, text: 'RakshaRank does not track users in real time.' },
  { icon: BrainCircuit, text: 'Safety score is based on user-submitted factors and AI analysis.' },
  { icon: PhoneCall, text: 'For immediate danger, call 112.', emphasis: true },
]

export default function ResponsibleAISection({ className = '' }) {
  return (
    <section className={`container-page py-16 ${className}`}>
      <div className="rounded-3xl border border-night/10 bg-white p-8 md:p-10 shadow-soft">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-2">Responsible AI</h2>
        <p className="text-ink-soft mb-8 max-w-2xl">
          RakshaRank uses AI to help explain a score, not to surveil anyone. Here's exactly what that means in
          practice.
        </p>
        <ul className="grid sm:grid-cols-2 gap-4">
          {POINTS.map(({ icon: Icon, text, emphasis }) => (
            <li
              key={text}
              className={`flex items-start gap-3 rounded-2xl p-4 ${
                emphasis ? 'bg-zone-unsafe-bg' : 'bg-paper-dim'
              }`}
            >
              <span
                className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl ${
                  emphasis ? 'bg-zone-unsafe text-white' : 'bg-night/5 text-night'
                }`}
              >
                <Icon size={16} />
              </span>
              <p className={`text-sm leading-relaxed pt-1.5 ${emphasis ? 'text-zone-unsafe font-semibold' : 'text-ink-soft'}`}>
                {text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
