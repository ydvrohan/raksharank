# RakshaRank

**Know the safety of every street before you go.**

RakshaRank is a hyperlocal women-safety scoring platform for India, built for the **Community Hero — Hyperlocal Problem Solver** hackathon track. Anyone can report an unsafe spot — a dark lane, an isolated ATM, a bus stop with no patrolling — and RakshaRank turns it into a transparent **Raksha Score** (0–100), a risk zone, a responsible department, and a ready-to-send complaint in Hindi and English, generated with the help of Google's Gemini AI.

> **Honesty note:** RakshaRank does **not** access any real CCTV feed, live police database, or government system. Every score is calculated purely from hyperlocal, user-reported safety factors plus AI reasoning on top of them. This is a hackathon MVP.

---

## ✨ Features

1. **Home page** — hero, plain-language explainer, "How it works", a "Powered by Google AI Studio + Gemini" badge, and a dedicated **Responsible AI** section.
2. **Report form** — issue description, location, time of issue, and 16 safety-factor checkboxes (8 positive, 8 negative).
3. **Raksha Score engine** (`calculateRakshaScore`) — a fully transparent, deterministic 0–100 scoring function, now with an explicit base/positive/negative breakdown (see below).
4. **AI Result panel** — report ID + timestamp, "Powered by Gemini" badge, an emergency disclaimer banner, a Score Breakdown ledger, issue title, category, score gauge, zone, urgency, score reasoning, positive/risk factors, responsible department, suggested action, **clean bilingual complaint subjects** (no raw Hinglish), full complaint letters in Hindi and English, safety tips, estimated resolution time, and Copy Complaint buttons.
5. **Community Safety Dashboard** — every report as a card, with `All / Safer / Moderate / Risky / Unsafe / Critical` quick filters, a status filter, search by location, editable status (Reported / In Progress / Resolved), a Copy Complaint button, and a two-step-confirm Delete button.
6. **Safety Heatmap** — a clean, card-grid heatmap (no map API), auto-formatted location names (`"near sbi atm"` → `"Near SBI ATM"`), a "Why this zone?" reason per tile, clear report counts, and a top summary bar (Most Urgent Zone, Average Raksha Score, Total Unsafe Zones, Total Community Reports, Recommended Action).
7. **Local storage persistence** — every report survives a refresh; the dashboard/heatmap seed themselves with sample community reports on first visit.
8. **Gemini / Google AI Studio integration** — `analyzeSafetyIssueWithGemini()` calls the real Gemini API when a key is configured, and automatically falls back to a deterministic rule-based analyzer when it isn't, so the app **never breaks** in a live demo.

---

## 🧮 The Raksha Score engine & breakdown

```
Base score = 50

+20  Nearby police station        -25  Deserted / sunsaan area
+15  CCTV near ATM                -20  Broken streetlight
+12  CCTV outside shop            -15  Isolated road
+15  Residential society nearby   -20  Late night risk
+10  Good street lighting         -15  Repeated safety complaints
+10  Public movement / crowded    -12  No shops or houses nearby
+8   Open shops nearby            -25  Harassment / loitering
+8   Security guard nearby        -15  No visible police patrolling

Final score clamped to [0, 100]
```

| Score   | Zone     |
|---------|----------|
| 80–100  | Safer    |
| 60–79   | Moderate |
| 40–59   | Risky    |
| 0–39    | Unsafe   |

`calculateRakshaScore()` (in `src/lib/rakshaScore.js`) now also returns `baseScore`, `totalPositive`, `totalNegative`, `rawScore`, and `wasClamped` — the exact numbers shown in the Result page's **Score Breakdown** card.

---

## 🧹 Clean complaint subjects (no raw Hinglish)

`src/lib/geminiService.js` no longer drops the user's raw issue text into the complaint subject. Instead it builds a clean subject from the detected category + the single most relevant risk factor + the formatted location:

- English: *"Complaint regarding unsafe dark lane near College Road, Jalandhar"*
- Hindi: *"कॉलेज रोड, जालंधर के पास असुरक्षित अंधेरी गली के संबंध में शिकायत"*

A `stripLeadingNear()` helper (in `src/lib/textFormat.js`) also prevents the common "near Near College Road" duplication when a user's location already starts with "near".

---

## 🤖 Connecting Google AI Studio / Gemini

The app works fully **without** an API key (offline rule-based fallback). The Gemini key is read **only on the
server**, inside `server.js` (via `process.env.GEMINI_API_KEY`) — it is never bundled into the browser.

1. Get a free key from **Google AI Studio**: https://aistudio.google.com/app/apikey
2. **Local testing:** copy `.env.example` to `.env`, fill in the key, then `npm run build && npm start` and
   open http://localhost:8080.
3. **Cloud Run:** set `GEMINI_API_KEY` as an environment variable on the service (see deployment section below).
4. No key configured anywhere? `server.js` automatically falls back to the same deterministic, rule-based
   analyzer in `src/lib/fallbackAnalysis.js` — nothing ever breaks.

---

## 🚀 Running the project locally

**Frontend only (fastest loop while building UI):**
```bash
npm install
npm run dev       # http://localhost:5173 — /api/analyze isn't served, falls back client-side
```

**Full stack, exactly like production (frontend + the real Express API):**
```bash
npm install
npm run build     # builds the frontend into dist/
npm start         # node server.js — serves dist/ AND /api/analyze on http://localhost:8080
```

Requires Node.js 18+ (20 recommended — that's what the Dockerfile uses).

---

## ☁️ Deploying to Google Cloud Run

```bash
# 1. One-time setup
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com artifactregistry.googleapis.com

# 2. Build and deploy directly from source (Cloud Build builds the Dockerfile for you)
gcloud run deploy raksharank \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key_here
```

That's it — Cloud Run builds the `Dockerfile`, pushes the image, and gives you a public HTTPS URL.

**Prefer Secret Manager over a plain env var (recommended for anything beyond a demo):**
```bash
echo -n "your_key_here" | gcloud secrets create gemini-api-key --data-file=-

gcloud run deploy raksharank \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest
```

**Updating the key later** (env vars only apply to new revisions):
```bash
gcloud run services update raksharank --set-env-vars GEMINI_API_KEY=new_key_here
```

**Testing the container locally before deploying** (needs Docker):
```bash
docker build -t raksharank .
docker run -p 8080:8080 -e GEMINI_API_KEY=your_key_here raksharank
# open http://localhost:8080
```

No key set in any of the above? Cloud Run still serves a fully working app — every request just uses the
offline fallback analyzer instead of real Gemini calls.

---

## 📁 File structure

```
RakshaRank/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── server.js                 # Express server for Cloud Run — serves dist/ + POST /api/analyze
├── Dockerfile                 # multi-stage build: Vite build → small Node runtime image
├── .dockerignore
├── .env.example
├── .gitignore
└── src/
    ├── main.jsx                  # entry point, router setup
    ├── App.jsx                   # routes + layout shell
    ├── index.css                 # Tailwind layers + base styles
    ├── lib/
    │   ├── factors.js            # all 16 safety factors (single source of truth)
    │   ├── rakshaScore.js        # calculateRakshaScore() — the scoring engine + breakdown
    │   ├── fallbackAnalysis.js   # shared, framework-agnostic rule-based analyzer (used by both
    │   │                         # server.js server-side and geminiService.js client-side)
    │   ├── geminiService.js      # analyzeSafetyIssueWithGemini() — POSTs to /api/analyze,
    │   │                         # falls back to fallbackAnalysis.js if that route is unreachable
    │   ├── textFormat.js         # titleCaseLocation(), stripLeadingNear()
    │   └── storage.js            # localStorage read/write/delete helpers
    ├── data/
    │   └── sampleReports.js      # seed reports for first-time dashboard/heatmap
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Footer.jsx
    │   ├── ScoreGauge.jsx        # the "Raksha Meter" — signature gauge visual
    │   ├── ScoreBreakdown.jsx    # base / positive / negative / final ledger
    │   ├── Badges.jsx            # ZoneBadge, UrgencyBadge, StatusBadge
    │   ├── PoweredByBadge.jsx    # "Powered by Google AI Studio + Gemini"
    │   ├── EmergencyBanner.jsx   # mandatory emergency disclaimer
    │   ├── ResponsibleAISection.jsx
    │   ├── CopyButton.jsx        # shared clipboard-copy button
    │   ├── ReportForm.jsx        # the report form + factor checkboxes
    │   ├── AIResultPanel.jsx     # full AI analysis result display
    │   ├── ReportCard.jsx        # dashboard report card (status/copy/delete)
    │   ├── HeatmapGrid.jsx       # grid-based safety heatmap + stats helpers
    │   └── HeatmapSummary.jsx    # top summary bar on the Heatmap page
    └── pages/
        ├── HomePage.jsx
        ├── ReportPage.jsx
        ├── DashboardPage.jsx
        └── HeatmapPage.jsx
```

> **Note:** this project previously deployed on Vercel via `api/analyze.js` (a serverless function). That file
> has been replaced by `server.js`, which does the same job as a single Express server suited to Cloud Run's
> container-based model. The scoring/AI logic itself (`src/lib/*`) didn't change at all — only how it's served.

---

## 🎨 Design system

- **Colours:** deep "street-at-dusk" indigo (`night`), warm paper background (`paper`), marigold/saffron accent (`marigold`), sindoor rose for safety touch-points (`sindoor`), and a 4-colour zone scale (`zone-safer/moderate/risky/unsafe`) that doubles as the product's core information system.
- **Type:** Space Grotesk (display), Inter (body), JetBrains Mono (scores/data — reinforces the "meter reading" feel).
- **Signature element:** the **Raksha Meter**, a semicircular gauge styled after auto-rickshaw fare meters and old electricity meters — a hyperlocal, street-level visual metaphor reused across the Hero, AI Result panel, and report cards.
