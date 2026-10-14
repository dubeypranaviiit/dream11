import { NextRequest, NextResponse } from 'next/server';
import { CatchUpRequest } from '@/types/api';
import { streamGeminiCatchUp } from '@/lib/gemini';
import { buildCatchUpPrompt } from '@/lib/prompts';
import { checkRateLimit, sanitizeText } from '@/lib/security';
import { BallEvent } from '@/types/cricket';
import { FantasyPlayer } from '@/types/fantasy';

function generateDynamicFallback(
  playedEvents: BallEvent[],
  userTeam: FantasyPlayer[],
  currentScore: { runs: number; wickets: number; overs: string },
  currentRank: number,
  totalPoints: number,
  language: 'en' | 'hinglish',
): string {
  const wicketsFallen = playedEvents.filter((e) => e.isWicket);
  const dismissedNames = Array.from(
    new Set(
      wicketsFallen
        .map((e) => e.dismissedPlayerName || e.batsmanName)
        .filter(Boolean),
    ),
  );

  const boundaryBatters = Array.from(
    new Set(
      playedEvents
        .filter((e) => e.isBoundaryFour || e.isSix)
        .map((e) => e.batsmanName)
        .filter(Boolean),
    ),
  );

  const activePlayers = userTeam.filter((p) => p.points !== 0);
  const topContributor = [...activePlayers].sort((a, b) => b.points - a.points)[0];
  const pendingPlayers = userTeam.filter((p) => p.points === 0);
  const pendingNames = pendingPlayers.map((p) => {
    const tag = p.isViceCaptain ? ' (VC)' : p.isCaptain ? ' (C)' : '';
    return `${p.name}${tag}`;
  });

  if (language === 'hinglish') {
    let matchSection = `Match Status: India ka score ${currentScore.runs}/${currentScore.wickets} (${currentScore.overs} overs) hai Pakistan ke khilaf.`;
    if (wicketsFallen.length > 0) {
      matchSection += ` Out hone wale batters: ${dismissedNames.join(', ')}.`;
    } else if (playedEvents.length > 0) {
      matchSection += ' Openers ne wicket sambhal kar shuruaat ki hai.';
    } else {
      matchSection += ' Match abhi shuru hua hai aur pehli ball phenki ja rahi hai.';
    }

    if (boundaryBatters.length > 0) {
      matchSection += ` Boundaries ${boundaryBatters.join(', ')} ke balle se aayi hain.`;
    }

    let teamSection = `Team Impact: Aapki fantasy team ke ${totalPoints} points hain aur simulated rank #${currentRank.toLocaleString()} par hai.`;
    if (topContributor) {
      teamSection += ` Aapke liye sabse zyada points ${topContributor.name} (${topContributor.points} pts) ne banaye hain.`;
    }

    let lookaheadSection = '';
    if (pendingPlayers.length > 0) {
      lookaheadSection = `Pending Players: ${pendingNames.join(', ')} ke abhi tak koi points nahi hain (no points yet).`;
    } else {
      lookaheadSection = 'Lookahead: Aapki fantasy team ke sabhi 11 players is match mein points contribute kar chuke hain.';
    }

    return `${matchSection}\n\n${teamSection}\n\n${lookaheadSection}`;
  }

  let matchSection = `Match Situation: India stands at ${currentScore.runs}/${currentScore.wickets} in ${currentScore.overs} overs against Pakistan.`;
  if (wicketsFallen.length > 0) {
    matchSection += ` Dismissals include ${dismissedNames.join(', ')}.`;
  } else if (playedEvents.length > 0) {
    matchSection += ' The batting side has established a stable start without early wickets.';
  } else {
    matchSection += ' The match is just getting underway with no legal deliveries completed yet.';
  }

  if (boundaryBatters.length > 0) {
    matchSection += ` Boundary scoring driven by ${boundaryBatters.join(', ')}.`;
  }

  let teamSection = `Your Team Standing: You currently have ${totalPoints} points at simulated rank #${currentRank.toLocaleString()}.`;
  if (topContributor) {
    teamSection += ` Top contributor so far is ${topContributor.name} with ${topContributor.points} pts.`;
  }

  let lookaheadSection = '';
  if (pendingPlayers.length > 0) {
    lookaheadSection = `Pending Players: ${pendingNames.join(', ')} have no points yet in this innings.`;
  } else {
    lookaheadSection = 'Squad Update: All 11 players in your fantasy lineup have actively recorded points in this match.';
  }

  return `${matchSection}\n\n${teamSection}\n\n${lookaheadSection}`;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    }

    const body = (await req.json()) as Partial<CatchUpRequest>;

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
    }

    const language = body.language === 'hinglish' ? 'hinglish' : 'en';
    const rawEvents = Array.isArray(body.playedEvents) ? body.playedEvents.slice(0, 35) : [];
    const rawTeam = Array.isArray(body.userTeam) ? body.userTeam.slice(0, 15) : [];

    const playedEvents: BallEvent[] = rawEvents.map((e) => ({
      ...e,
      description: sanitizeText(e.description || '', 200),
      batsmanName: sanitizeText(e.batsmanName || '', 50),
      bowlerName: sanitizeText(e.bowlerName || '', 50),
      dismissedPlayerName: sanitizeText(e.dismissedPlayerName || '', 50),
    }));

    const userTeam: FantasyPlayer[] = rawTeam.map((p) => ({
      ...p,
      name: sanitizeText(p.name || '', 50),
    }));

    const currentScore = body.currentScore || { runs: 0, wickets: 0, overs: '0.0' };
    const currentRank = typeof body.currentRank === 'number' ? body.currentRank : 15000;
    const totalPoints = typeof body.totalPoints === 'number' ? body.totalPoints : 0;

    const fallbackText = generateDynamicFallback(
      playedEvents,
      userTeam,
      currentScore,
      currentRank,
      totalPoints,
      language,
    );

    const prompt = buildCatchUpPrompt(
      playedEvents,
      userTeam,
      currentScore,
      currentRank,
      totalPoints,
      language,
    );

    const stream = await streamGeminiCatchUp(prompt, language, fallbackText);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error while streaming catch-up summary' },
      { status: 500 },
    );
  }
}
