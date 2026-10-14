# Match Pulse — AI Live Fantasy Cricket Assistant

A production-grade, mobile-first prototype built for the Dream11 Forward Deployed Engineer Intern assignment. Match Pulse solves the primary frustration fantasy sports fans face in live matches: understanding why their points, rankings, and multipliers fluctuate, plus catching up mid-match in seconds without confusion.

---

## 1. The Fan Problem

During a high-stakes live match (e.g., India vs Pakistan T20), fantasy cricket users experience high anxiety when their points and rankings fluctuate without immediate context:
- **"Why did I lose 12 points when my captain got out for 3?"**
- **"Three different events just happened on one ball — did my team gain or lose points overall?"**
- **"I opened the app at Over 3.4 — what did I miss, and who in my team is yet to play?"**

Existing scorecards display traditional cricket metrics (runs, overs, wickets) but leave fans manually calculating complex fantasy rules (duck penalties, captain 2x multipliers, catches, boundary bonuses, and net team deltas).

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
|  - Official Dream11 T20 Rules (DREAM11_T20_RULES)                                 |
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
LLMs are prone to arithmetic hallucination and non-deterministic scoring errors. To ensure 100% compliance with official Dream11 rules:
- **`lib/scoring.ts`** calculates all base points, multipliers (2x Captain, 1.5x Vice-Captain), and net totals strictly in TypeScript.
- The pre-computed breakdown is injected into the Gemini prompt. The AI's sole role is to translate the math into friendly, cricket-savvy natural language (max 2 sentences, English or Hinglish).
- If the Gemini API times out (8 seconds), hits a rate limit, or if no API key is provided, the route instantly returns a deterministic fallback explanation. **The UI never breaks.**

---

## 3. Why Redux Toolkit (RTK)?

1. **Predictable Unidirectional Data Flow for Complex Multi-Entity State**:
   A single ball event simultaneously impacts the match score, bowler stats, batsman stats, wicketkeeper points, captain multipliers, cumulative fantasy points, and simulated leaderboard ranking. Redux Toolkit centralizes this logic in a predictable store without prop-drilling.
2. **Unified Asynchronous Orchestration (`playNextBall` Thunk)**:
   Advancing a ball requires sequential, atomic steps:
   - Advance the event in `matchSlice`.
   - Compute and apply fantasy points in `teamSlice`.
   - Update simulated rank.
   - Dispatch `fetchExplanationForBall` in `aiSlice` (with request cancellation via `AbortController`).
3. **Derived Memoized Selectors (`createSelector`)**:
   - `selectTotalPoints`: Dynamically derived by summing the 11 player point tallies rather than storing duplicate state.
   - `selectLiveMatchScore`: Derived from the current ball index.
   - `selectPendingPlayers`: Identifies players who have not yet batted or bowled (e.g., Vice-Captain Jasprit Bumrah waiting for the 2nd innings).
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
> **Note**: If `GEMINI_API_KEY` is omitted or empty, Match Pulse automatically activates the built-in deterministic fallback engine. All explanations and streaming catch-up summaries remain fully functional.

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

## 5. Running Tests & Quality Verification

```bash
# Run unit tests (Vitest)
npm test

# Run ESLint check
npm run lint

# Run TypeScript strict type-check
npx tsc --noEmit
```

### Test Coverage Highlights (`tests/scoring.test.ts`)
- **Official Dream11 Constants**: Run, Boundary Four (+4 bonus), Six (+6 bonus), Duck (-2), Wicket (+25), LBW/Bowled (+8 bonus), Catch (+8), Stumping (+12), Direct Run-Out (+12), Indirect (+6), Maiden Over (+12).
- **Six Bonus**: 6 runs + 6 bonus = 12 points.
- **Duck Penalty x Captain Multiplier**: -2 x 2.0 = -4 points.
- **Vice-Captain Multiplier**: 25 wicket points x 1.5 = 38 points.
- **Multi-Player Net Impact**: Kohli duck (-4 pts) + Shaheen wicket (+25 pts) + Rizwan catch (+8 pts) = **+29 net points**.
- **Non-Team Ball**: Zero points and zero impact.

---

## 6. Key Features Walkthrough

1. **Simulate Next Ball & Autoplay**:
   Advance through 31 realistic T20 balls (dots, fours, sixes, wickets, wides, and run-outs) or toggle Auto-Play.
2. **"Join Late at Ball 15"**:
   One-click shortcut simulating the first 15 balls instantly so the "Catch me up" feature can be tested in a mid-game state.
3. **Reactive "Why Did My Points Change?" Card**:
   Instant display of net points (+29 / -4), simulated rank change, and a 2-sentence conversational explanation.
4. **30-Second AI Match Catch-Up**:
   Click the "Catch me up" button in the header to open a streaming modal providing:
   - Match situation so far.
   - What changed for your fantasy team.
   - Lookahead for pending players (e.g., VC Bumrah bowling in the 2nd innings).
5. **Language Switcher (English / Hinglish)**:
   Toggle between English and authentic cricket Hinglish with instant adaptation.
6. **Mobile-First & Accessible**:
   Optimized for mobile touch targets, dark sports UI theme, semantic HTML, and ARIA dialog attributes.

---

## 7. Deploying to Vercel

Match Pulse is built on the Next.js App Router and is 100% Vercel-ready:

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import the `dream11` repository.
4. In the **Environment Variables** section:
   - Key: `GEMINI_API_KEY`
   - Value: `your_gemini_api_key`
5. Click **Deploy**. Vercel will build the static shell and serverless edge route handlers automatically.
