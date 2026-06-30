# Deadline Rescue

**An AI-powered last-minute task planner that helps you recover when time is running out.**

🔗 **Live App:** [deadline-rescue-app.web.app](https://deadline-rescue-app.web.app)

---

## The Problem

Last-minute deadline panic is universal. Existing to-do apps track deadlines but don't help you figure out *how* to actually meet them when you're already behind. Deadline Rescue fills that gap with an AI planner that breaks down a looming deadline into a realistic, achievable day-by-day plan — and adapts when life gets in the way.

## How It Works

Tell Deadline Rescue your deadline and task scope, and it generates a structured rescue plan using Google's Gemini API. If you fall behind on a day, one-click rescheduling intelligently redistributes the remaining work across whatever time is left, keeping the plan realistic instead of letting it collapse.

## Key Features

- **AI-generated rescue plans** — tailored day-by-day breakdowns powered by Gemini
- **One-click rescheduling** — an agentic loop that recalculates your plan when you fall behind
- **Calendar export (.ics)** — drop your plan straight into Google Calendar, Outlook, or Apple Calendar
- **Progress tracking** — visual indicators across your rescue plan
- **Dark mode** — for those late-night planning sessions
- **Completion celebration** — confetti on finishing, because deadlines under pressure deserve a small win

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **AI:** Google Gemini API (`gemini-3.5-flash`)
- **Storage:** localStorage (client-side persistence)
- **Calendar Export:** native `.ics` file generation
- **Celebration:** `canvas-confetti`
- **Hosting:** Firebase Hosting (Google Cloud)

## Google Technologies Used

- **Gemini API** — powers all AI-generated rescue plans and rescheduling logic
- **Firebase Hosting** — production deployment on Google Cloud infrastructure

## Getting Started Locally

\`\`\`bash
git clone https://github.com/RM-f1/Deadline_rescue_app.git
cd Deadline_rescue_app
npm install
\`\`\`

Create a \`.env\` file in the project root:

\`\`\`bash
printf "VITE_GEMINI_API_KEY=your_gemini_api_key_here\n" > .env
\`\`\`

Get a free Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

Run the dev server:

\`\`\`bash
npm run dev
\`\`\`

Build for production:

\`\`\`bash
npm run build
\`\`\`

## Deployment

This app is deployed via Firebase Hosting:

\`\`\`bash
npm run build
firebase deploy
\`\`\`

---

Built for the BlockseBlock Hackathon 2025.
