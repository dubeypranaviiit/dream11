# Match Pulse — AI Live Fantasy Cricket Assistant

A mobile-first prototype built for the Dream11 Forward Deployed Engineer Intern assignment. Match Pulse addresses the primary frustration fantasy sports fans face during live matches: understanding why their points, rankings, and multipliers fluctuate, and catching up mid-match in seconds without confusion.

---

## 1. The Fan Problem

During a high-stakes live match (e.g., India vs Pakistan T20), fantasy cricket users experience anxiety when their points and rankings fluctuate without immediate context:
- **"Why did I lose 12 points when my captain got out for 3?"**
- **"Three different events just happened on one ball — did my team gain or lose points overall?"**
- **"I opened the app at Over 3.4 — what did I miss, and who in my team is yet to play?"**

Traditional cricket scorecards show standard cricket metrics (runs, overs, wickets) but leave fans manually calculating complex fantasy rules (duck penalties, captain 2x multipliers, catches, boundary bonuses, and net team deltas).

**Match Pulse bridges this gap in under 10 seconds:**
1. Computes deterministic point changes per ball across all user players.
2. Formulates clear AI explanations of the net impact and rank shifts in English or Hinglish.
3. Provides a 30-second live streaming catch-up summary for users joining mid-game.

---

## 2. Architecture & Data Flow

```
+-----------------------------------------------------------------------------------+
|                                 LIVE CRICKET EVENT                                |
|          (BallEvent: Over 0.5 - Shaheen to Kohli: OUT! Caught Behind (0))         |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                      DETERMINISTIC ENGINE (lib/scoring.ts)                        |
|  - Built from Dream11's Published T20 Scoring Rules (DREAM11_T20_RULES)           |
|  - Kohli (Captain): Duck Penalty (-2) x 2.0 = -4 pts                              |
|  - Shaheen: Wicket = +25 pts                                                      |
|  - Rizwan: Catch = +8 pts                                                         |
|  - NET Team Delta: (-4) + 25 + 8 = +29 pts                                        |
|  - Simulated Rank: Improved 2,175 spots (15,000 -> 12,825)                        |
+-----------------------------------------------------------------------------------+
          |                                                       |
          | (Instant Optimistic Update)                           | (Numbers Injected)
          v                                                       v
+-------------------------------------+         +-----------------------------------+
|         REDUX TOOLKIT STORE         |         |     NEXT.JS ROUTE HANDLER         |
|  - teamSlice: Players, Points, Rank |         |       (app/api/explain)           |
|  - matchSlice: Score, Over, Events  |         |  - Structured Prompt (No invented |
|  - selectTotalPoints (Derived)      |         |    numbers allowed)               |
+-------------------------------------+         |  - Gemini Flash API (8s timeout)  |
          |                                     |  - Deterministic Fallback Guard   |
          |                                     |  - Rate-Limited & Sanitized       |
          |                                     +-----------------------------------+
          |                                                       |
          +---------------------------+---------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------------+
|                               USER INTERFACE (UI/UX)                              |
|  - Header: Live Score (IND 4/2), Simulated Demo Match Badge, Language Toggle      |
|  - Why Did My Points Change? Card: +29 pts badge, Rank Delta, AI breakdown        |
|  - Catch Me Up: Streaming real-time 30-second summary                             |
|  - My Team Panel: 11 players, C (2x) / VC (1.5x) tags, Total Points, Sim Rank     |
|  - Event Feed: Memoized Ball-by-ball commentary                                   |
+-----------------------------------------------------------------------------------+
```

### Why Pre-compute Points in Deterministic Code?
LLMs are prone to arithmetic hallucination and non-deterministic scoring errors. To ensure calculation fidelity:
- **`lib/scoring.ts`** calculates all base points, multipliers (2.0x Captain, 1.5x Vice-Captain preserving decimals like 37.5 pts), and net totals strictly in TypeScript.
- The pre-computed breakdown is injected into the Gemini prompt. The AI's sole role is to translate the math into friendly, cricket-savvy natural language (max 2 sentences, English or Hinglish).
- If the Gemini API times out (8 seconds), hits a rate limit, or if no API key is provided, the route instantly returns a deterministic fallback explanation. The UI never breaks.

---

## 3. Why Redux Toolkit (RTK)?

1. **Predictable Unidirectional Data Flow for Multi-Entity State**:
   A single ball event simultaneously impacts the match score, bowler stats, batsman stats, wicketkeeper points, captain multipliers, cumulative fantasy points, and simulated leaderboard ranking. Redux Toolkit centralizes this logic in a predictable store without prop-drilling.
2. **Unified Asynchronous Orchestration (`playNextBall` Thunk)**:
   Advancing a ball executes atomic steps:
   - Advance the event in `matchSlice`.
   - Compute and apply fantasy points in `teamSlice`.
   - Update simulated rank.
   - Dispatch `fetchExplanationForBall` in `aiSlice` (with request cancellation via `AbortController`).
3. **Derived Memoized Selectors (`createSelector`)**:
   - `selectTotalPoints`: Dynamically derived by summing the 11 player point tallies rather than storing duplicate state.
   - `selectLiveMatchScore`: Derived from the current ball index.
   - `selectPendingPlayers`: Identifies players in the user's lineup who have 0 points and are yet to bat or bowl.
4. **Request Caching**:
   `aiSlice.explanationCache` stores explanations by `ballId_language` to eliminate redundant network calls when re-visiting events.

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js 18+ (tested on Node.js v24)
- npm 9+

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd dream11

# Install dependencies
npm install
```

### Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your Gemini API Key in `.env.local`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
> **Note**: If `GEMINI_API_KEY` is omitted or empty, Match Pulse automatically activates the built-in deterministic fallback engine. All explanations and streaming catch-up summaries remain functional. You can optionally set `GEMINI_MODEL=gemini-2.5-flash` or another supported flash model.

### Running the App
```bash
# Start development server
npm run dev

# Or build and run production server
npm run build
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Security & Rate Limiting

- **Endpoint Rate Limiting**: Both `/api/explain` and `/api/catch-up` implement per-IP rate limiting (`lib/security.ts`) capped at 20 requests per minute per IP, responding with HTTP 429 when exceeded.
- **Payload Sanitization & Size Caps**:
  - `playedEvents` is capped at a maximum of 35 deliveries.
  - `userTeam` is capped at 15 players.
  - `event.description` and player names are sanitized and capped at 200 characters to prevent prompt injection attempts.
- **Budget & Quota Cap Advice**: For production deployments or live demo sessions, configure spending budgets and per-minute quota limits directly within Google AI Studio / Google Cloud Console to prevent unexpected usage spikes.

---

## 6. Running Tests & Quality Verification

```bash
# Run unit tests (Vitest)
npm test

# Run ESLint check
npm run lint

# Run TypeScript strict type-check
npx tsc --noEmit
```

### Scoring Rules & Test Coverage (`tests/scoring.test.ts`)
Built from Dream11's published T20 scoring rules:
- **Batting**: 1 pt/run; +1 boundary bonus (for 4); +2 six bonus (for 6); -2 duck penalty (for batsman, wicketkeeper, all-rounder out on 0).
- **Bowling**: +25 per wicket (excl. run-out); +8 LBW/Bowled bonus; +12 maiden over.
- **Fielding**: +8 catch; +12 stumping; +12 direct run-out; +6 shared run-out.
- **Multipliers**: Captain receives 2.0x; Vice-Captain receives 1.5x (retaining exact decimals, e.g. 25 * 1.5 = 37.5 pts).
- **Multi-Player Net Impact**: Kohli duck (-4 pts) + Shaheen wicket (+25 pts) + Rizwan catch (+8 pts) = **+29 net points**.
- **Non-Team Ball**: Zero points and zero impact.

### Note on `npm audit`
`npm audit` reports a high-severity advisory on transitive `braces` dependencies through `eslint-config-next@16.4.0`. Running `npm audit fix --force` would downgrade `eslint-config-next` to version 14.x, which is a breaking change incompatible with Next.js 16 and React 19. The installed resolution already provides `braces@3.0.3`.

---

## 7. Key Features Walkthrough

1. **Simulate Next Ball & Autoplay**:
   Advance through 31 realistic T20 deliveries (dots, boundaries, sixes, wickets, wides, and a run-out) or toggle Auto-Play.
2. **"Join Late at Ball 15"**:
   Simulates the first 15 deliveries instantly so the "Catch me up" feature can be tested from a mid-innings state.
3. **Reactive "Why Did My Points Change?" Card**:
   Instant display of net points (+29 / -4), simulated rank change, and a 2-sentence conversational explanation.
4. **30-Second AI Match Catch-Up**:
   Click the "Catch me up" button in the header to open a streaming modal providing:
   - Match situation dynamically extracted from played deliveries.
   - Fantasy team standing and top contributors.
   - Lookahead for pending players yet to score points in the lineup.
5. **Language Switcher (English / Hinglish)**:
   Toggle between English and casual cricket Hinglish with instant adaptation.
6. **Mobile-First Design**:
   Optimized for mobile touch targets, dark sports UI theme, semantic HTML, and ARIA dialog attributes.

---

## 8. Deploying to Vercel

Match Pulse is built on the Next.js App Router and deploys as standard serverless route handlers:

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import the `dream11` repository.
4. In the **Environment Variables** section:
   - Key: `GEMINI_API_KEY`
   - Value: `your_gemini_api_key`
5. Click **Deploy**. Vercel will build the static shell and serverless route handlers automatically.
