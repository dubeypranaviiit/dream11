import { NextRequest, NextResponse } from 'next/server';
import { CatchUpRequest } from '@/types/api';
import { streamGeminiCatchUp } from '@/lib/gemini';
import { buildCatchUpPrompt } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CatchUpRequest>;

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
    }

    const language = body.language === 'hinglish' ? 'hinglish' : 'en';
    const playedEvents = Array.isArray(body.playedEvents) ? body.playedEvents : [];
    const userTeam = Array.isArray(body.userTeam) ? body.userTeam : [];
    const currentScore = body.currentScore || { runs: 0, wickets: 0, overs: '0.0' };
    const currentRank = typeof body.currentRank === 'number' ? body.currentRank : 15000;
    const totalPoints = typeof body.totalPoints === 'number' ? body.totalPoints : 0;

    let fallbackText = '';
    if (language === 'hinglish') {
      fallbackText =
        `Match Update: India ka score ${currentScore.runs}/${currentScore.wickets} (${currentScore.overs} overs) hai. Shaheen Afridi ke sharp spell ne Indian top-order ko pressure mein daal diya.\n\n` +
        `Team Impact: Aapki fantasy team ke paas ${totalPoints} points hain aur simulated rank #${currentRank.toLocaleString()} par hai. Boundary bonuses aur catches se points gather hue hain.\n\n` +
        `Lookahead: Aapke Vice-Captain Jasprit Bumrah aur Arshdeep Singh 2nd innings mein bowling karenge, jahan se massive points aane ki umeed hai.`;
    } else {
      fallbackText =
        `Match Situation: India is currently ${currentScore.runs}/${currentScore.wickets} in ${currentScore.overs} overs. Shaheen Afridi made early inroads with intense pace and swing against the top order.\n\n` +
        `Your Team Standing: You currently have ${totalPoints} points, placing you at simulated rank #${currentRank.toLocaleString()}. Wicket and boundary bonuses have stabilized your point trajectory.\n\n` +
        `Upcoming Players: Indian strike bowlers, including your Vice-Captain Jasprit Bumrah and Arshdeep Singh, are yet to bowl and will take the field in the second innings.`;
    }

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
