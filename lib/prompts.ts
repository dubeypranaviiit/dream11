import { BallEvent } from '@/types/cricket';
import { BallPointsResult, FantasyPlayer } from '@/types/fantasy';
import { AppLanguage } from '@/types/api';

export const SYSTEM_PROMPTS = {
  en: `You are Match Pulse, an expert AI cricket and fantasy analyst for Dream11 fans.
Your goal is to explain fantasy point changes with extreme clarity and crispness.
Rules:
1. Max 2 sentences total.
2. Friendly, energetic, cricket-savvy tone.
3. NEVER invent or recalculate points. You MUST ONLY use the exact numbers and breakdown provided in the user prompt.
4. Clearly state each player's breakdown, the net team points delta, and the simulated rank impact.
5. Explain any cricket jargon briefly if relevant.
6. Do NOT use markdown bold headers or bullet points; write a coherent, punchy 2-sentence paragraph. No unnecessary emojis.`,

  hinglish: `You are Match Pulse, Dream11 fans ke liye expert AI cricket aur fantasy analyst.
Aapka kaam hai fantasy points change ko sabse aasan aur engaging Hinglish mein explain karna.
Rules:
1. Maximum 2 sentences total.
2. Friendly, cricket-savvy, authentic casual Hinglish (Hindi written in English alphabet, e.g. "Aapke Captain Virat Kohli duck par out ho gaye").
3. NEVER invent or recalculate points. Jo exact numbers prompt mein diye hain sirf wahi use karo.
4. Har affected player ka point breakdown, overall team ka net point change, aur simulated rank par asar clearly batao.
5. Do NOT use markdown bold headers or bullet points; natural, punchy 2 sentences likho. No unnecessary emojis.`,
};

export function buildExplainPrompt(
  event: BallEvent,
  breakdown: BallPointsResult,
  language: AppLanguage,
  previousRank: number,
  newRank: number,
): string {
  const rankDelta = previousRank - newRank;
  const rankImpactStr =
    rankDelta > 0
      ? `improved by ${Math.abs(rankDelta).toLocaleString()} spots (from #${previousRank.toLocaleString()} to #${newRank.toLocaleString()})`
      : rankDelta < 0
        ? `dropped by ${Math.abs(rankDelta).toLocaleString()} spots (from #${previousRank.toLocaleString()} to #${newRank.toLocaleString()})`
        : `stayed at #${newRank.toLocaleString()}`;

  const playerBreakdownText = breakdown.playerBreakdowns
    .map((p) => {
      const roleTag = p.isCaptain ? ' [CAPTAIN - 2x Multiplier]' : p.isViceCaptain ? ' [VICE-CAPTAIN - 1.5x Multiplier]' : '';
      return `- ${p.playerName}${roleTag}: Base ${p.basePoints} pts (${p.reasons.join(', ')}), Multiplier: ${p.multiplier}x -> Net: ${p.netPoints > 0 ? '+' : ''}${p.netPoints} pts`;
    })
    .join('\n');

  return `Ball Event Details:
- Ball: Over ${event.displayOver}
- Description: ${event.description}
- Match Score: ${event.inningsScore.runs}/${event.inningsScore.wickets} in ${event.inningsScore.overs} overs

Pre-computed Fantasy Breakdown for User's Team:
${playerBreakdownText}

Overall Net Team Points Change on this ball: ${breakdown.netTeamPointsDelta > 0 ? '+' : ''}${breakdown.netTeamPointsDelta} pts
Simulated Rank Impact: ${rankImpactStr}

Instruction: Write a 2-sentence explanation in ${language === 'hinglish' ? 'casual cricket Hinglish' : 'clear energetic English'} detailing each player's points, the net total of ${breakdown.netTeamPointsDelta > 0 ? '+' : ''}${breakdown.netTeamPointsDelta} pts, and how the simulated rank changed.`;
}

export function buildCatchUpPrompt(
  playedEvents: BallEvent[],
  userTeam: FantasyPlayer[],
  currentScore: { runs: number; wickets: number; overs: string },
  currentRank: number,
  totalPoints: number,
  language: AppLanguage,
): string {
  const lastBallsSummary = playedEvents
    .slice(-6)
    .map((e) => `[Over ${e.displayOver}]: ${e.description}`)
    .join('\n');

  const activePlayers = userTeam.filter((p) => p.points !== 0);
  const pendingPlayers = userTeam.filter((p) => p.points === 0);

  const activePlayersText = activePlayers
    .map((p) => `${p.name}${p.isCaptain ? ' (C)' : p.isViceCaptain ? ' (VC)' : ''}: ${p.points} pts`)
    .join(', ');

  const pendingText = pendingPlayers
    .map((p) => `${p.name}${p.isViceCaptain ? ' (VC)' : p.isCaptain ? ' (C)' : ''}`)
    .join(', ');

  return `Task: Provide a concise, high-energy 30-second match & fantasy catch-up summary for a fan who just opened the app mid-match.

Match State:
- Score: India ${currentScore.runs}/${currentScore.wickets} (${currentScore.overs} overs) vs Pakistan
- Recent match action:
${lastBallsSummary}

User Fantasy Team State:
- Total Points: ${totalPoints} pts
- Current Simulated Rank: #${currentRank.toLocaleString()}
- Active Contributors: ${activePlayersText || 'No fantasy points yet'}
- Pending players yet to bat or bowl: ${pendingText || 'All players have been active'}

Output Format in ${language === 'hinglish' ? 'Hinglish' : 'English'}:
- Paragraph 1: Match narrative so far (key wickets/highlights in 2-3 sentences).
- Paragraph 2: What changed for the user's team (captains/scorers and current points/rank).
- Paragraph 3: Strategic lookahead: which players in the team are yet to bat or bowl.
Keep it conversational, punchy, and cricket-savvy. No unnecessary emojis.`;
}
