<div align="center">

# 🇬🇭 AlertGH — Ghana Emergency Grid

**A citizen-driven emergency reporting and response platform for Ghana.**  
Report hazards anonymously, track live incidents on an interactive map, and coordinate official emergency dispatch — all in one place.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## Overview

Ghana faces recurring public safety challenges — flash flooding in Accra, bushfires in the Northern Region, road accidents on the Tema Motorway, and power grid failures across major cities. When these events happen, citizens often have no fast, structured way to warn others or reach the right emergency service.

**AlertGH** solves this by giving every Ghanaian a simple tool to report safety hazards anonymously in seconds, while giving official emergency responders (NADMO, Ghana Police, GNFS, NAS) a dedicated console to monitor, verify, dispatch, and resolve incidents in real time. The platform covers all 16 regions of Ghana, supports live Firestore sync, and works offline via a localStorage fallback — so it stays useful even in low-connectivity areas.

---

## Key Features

- **🗺️ Interactive Ghana Emergency Map** — A custom SVG map of all 16 Ghanaian regions with live pulsing incident pins. Filter by category (flooding, fire, accident, road closure, power outage, medical) and severity (critical, high, medium, low). Click any pin to inspect full incident details.

- **📢 Anonymous Citizen Reporting** — A 4-step guided wizard (Type → Area → Evidence → Verify) lets any citizen report a hazard without creating an account. Supports preset hazard photos or live camera capture. Reports are rate-limited (3 per 60 seconds) and sanitized before reaching Firestore.

- **🤖 AI-Powered Severity Suggestion** — Powered by Google Gemini 2.0 Flash. When filling out a report, citizens can tap "AI Suggest" to get an instant severity recommendation (critical/high/medium/low) with a one-sentence reason, based on the incident title, description, category, and location.

- **🛡️ Responder Mode (Official Dispatch Console)** — Authenticated emergency responders get a full action center: add official advisories, change incident status (Active / Investigating / Resolved), adjust threat severity, flag reports as spam/duplicate/fraudulent, and permanently delete misinformation. A persistent blue banner activates when Responder Mode is on.

- **👤 Guest Responder Access** — Users can enter Responder Mode as a read-only guest (view all incidents including flagged ones, see the action center UI) without signing in. Destructive actions prompt a sign-in gate.

- **📊 Analytics Dashboard** — Real-time metrics including active incident count, community verification score, resolution rate, safety rating index, category breakdown with animated progress bars, and a 24-hour incident cycle chart.

- **📞 Emergency Contacts Directory** — A curated, searchable directory of Ghana's national emergency lines: National Ambulance Service (193), Ghana National Fire Service (192), Ghana Police Service (191), NADMO, ECG, GWCL, and more. Includes one-tap quick-dial links and NADMO safety preparedness guidelines.

- **🔔 Push Notification System** — In-app notification center with geofence filtering (nationwide or per-region), severity filters, hazard category filters, a mute toggle, and a notification history inbox. Toast alerts appear for new incidents and status updates. Includes a live simulator to test routing.

- **🌙 Light / Dark Mode** — Full theme support with smooth transitions. Respects the user's OS preference on first load and persists the choice to localStorage.

- **🎓 First-Time Onboarding Walkthroughs** — Separate animated onboarding flows for Citizen Mode and Responder Mode, shown once on first visit and replayable via the help button.

- **📱 PWA Support** — Installable as a Progressive Web App with a service worker for offline caching, a web manifest, and mobile-optimized UI with a sticky bottom tab bar and iOS-style swipe-to-dismiss modals.

- **🔗 Deep Linking** — Incidents are shareable via URL (`?incident=<id>`). Opening a shared link auto-selects and highlights the incident on the map.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 + TypeScript 5.8 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Animations | Motion (Framer Motion v12) |
| Icons | Lucide React |
| Backend / Database | Firebase Firestore (real-time `onSnapshot`) |
| Authentication | Firebase Auth (Email/Password) |
| File Storage | Firebase Storage (camera image uploads) |
| AI Integration | Google Gemini 2.0 Flash (`@google/genai`) |
| PWA | Custom Service Worker + Web Manifest |
| Package Manager | npm (Bun lockfile also present) |

---

## Project Structure

```
alertgh/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service worker (cache + network-first)
├── src/
│   ├── assets/images/         # Ghana-themed background images
│   ├── components/
│   │   ├── DashboardStats.tsx # Analytics tab — metrics, charts, category breakdown
│   │   ├── EmergencyDirectory.tsx # Hotlines tab — contacts directory
│   │   ├── GhanaMap.tsx       # Interactive SVG map with incident pins
│   │   ├── Onboarding.tsx     # Citizen mode first-time walkthrough
│   │   ├── ReportForm.tsx     # 4-step incident reporting wizard + AI suggest
│   │   └── ResponderOnboarding.tsx # Responder mode first-time walkthrough
│   ├── data/
│   │   └── ghanaData.ts       # All 16 Ghana regions, seed incidents, emergency contacts
│   ├── hooks/
│   │   ├── useAuth.ts         # Firebase auth state (login, register, logout)
│   │   └── useNotifications.ts # Push notification state, geofence filtering, toast
│   ├── App.tsx                # Root component — all tabs, modals, state orchestration
│   ├── firebase.ts            # Firebase init, Firestore CRUD, real-time listener, rate limiting
│   ├── types.ts               # TypeScript interfaces (Incident, EmergencyContact, etc.)
│   ├── utils.ts               # formatTimeAgo helper
│   └── main.tsx               # React entry point
├── firestore.rules            # Firestore security rules
├── .env.example               # Environment variable template
├── index.html                 # PWA meta tags, OG tags, SW registration
├── vite.config.ts
└── package.json
```

---

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org) v18 or later
- A Firebase project (see [Firebase Setup](#firebasebackend-setup) below)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com) (optional — only needed for the AI severity suggestion feature)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/alertgh.git
cd alertgh
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Open `.env.local` and set the following:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"

# Gemini AI (optional — for AI severity suggestions in the report form)
VITE_GEMINI_API_KEY="your-gemini-api-key"
```

> **Note:** All Firebase variables must be prefixed with `VITE_` to be accessible in the browser via Vite's `import.meta.env`. If Firebase variables are missing, the app automatically falls back to localStorage — fully functional for local testing without any Firebase project.

### 4. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Other scripts

```bash
npm run build    # Production build
npm run preview  # Preview the production build locally
npm run lint     # TypeScript type check (tsc --noEmit)
```

---

## Firebase / Backend Setup

AlertGH uses two Firebase services:

- **Cloud Firestore** — stores incidents and emergency contacts. On first load, the app auto-seeds Firestore with sample Ghanaian incidents if the collection is empty.
- **Firebase Authentication** — Email/Password sign-in for official responders. No Google Sign-In or Phone Auth is required by default, though Firebase supports adding them.
- **Firebase Storage** — stores camera-captured incident photos uploaded from the report form.

### If you're forking this repo and connecting your own Firebase project:

1. Go to the [Firebase Console](https://console.firebase.google.com) and create a new project.
2. Enable **Firestore Database** (start in production mode).
3. Enable **Authentication** → Sign-in method → **Email/Password**.
4. Enable **Storage** and set up a default bucket.
5. Copy your project's web app config values into `.env.local` as shown above.
6. Deploy the Firestore security rules:

```bash
firebase deploy --only firestore:rules
```

The included `firestore.rules` enforces:
- Public read access to all incidents and contacts
- Public incident creation with required field validation (title ≤ 200 chars, description ≤ 2000 chars, initial status must be `active`)
- Citizens can only update vote fields (`upvotes`, `downvotes`, `verificationScore`)
- Authenticated responders can update/delete any incident
- All other paths are denied by default

---

## Screenshots / Demo

> 📸 Screenshots and demo GIFs will be added here.

To add your own:
1. Take screenshots of the Map, Analytics, and Directory tabs in both light and dark mode.
2. Place them in a `/screenshots` folder at the project root.
3. Reference them here:

```markdown
![Map View - Light Mode](screenshots/map-light.png)
![Responder Console](screenshots/responder-mode.png)
![Analytics Dashboard](screenshots/analytics.png)
![Report Form - AI Suggest](screenshots/report-ai.png)
```

---

## Roadmap / Future Improvements

- [ ] **Google Maps / Mapbox integration** — replace the custom SVG map with a real satellite/street map for precise GPS-based incident pinning
- [ ] **SMS / WhatsApp alerts** — integrate Twilio or Africa's Talking to push critical alerts to feature phones without internet
- [ ] **Responder role management** — admin panel to approve/revoke responder accounts by agency (NADMO, GNFS, Police, NAS)
- [ ] **Incident photo gallery** — allow multiple images per report, not just one
- [ ] **Offline-first PWA** — full service worker sync queue so reports submitted offline are automatically pushed to Firestore when connectivity returns
- [ ] **Multi-language support** — Twi, Hausa, Ewe, and Ga translations for broader citizen reach
- [ ] **Heatmap overlay** — visualize incident density by region over time on the map
- [ ] **Public API** — expose a read-only REST endpoint so third-party apps (news outlets, NGOs) can consume live incident data
- [ ] **Automated severity escalation** — if an incident receives a high upvote count within a short window, auto-escalate its severity and notify subscribed responders

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and ensure TypeScript passes:
   ```bash
   npm run lint
   ```
4. **Commit** with a clear message:
   ```bash
   git commit -m "feat: add heatmap overlay to Ghana map"
   ```
5. **Push** your branch and open a **Pull Request** against `main`

Please keep PRs focused and include a short description of what changed and why. For large features, open an issue first to discuss the approach.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Credits

<div align="center">

Made with ❤️ by **Freda Creations**

*Freedom and Justice — Built for Ghana 🇬🇭*

</div>
