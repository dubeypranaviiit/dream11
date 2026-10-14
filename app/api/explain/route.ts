import { NextRequest, NextResponse } from 'next/server';
import { ExplainRequest, ExplainResponse } from '@/types/api';
import { generateGeminiExplanation } from '@/lib/gemini';
import { buildExplainPrompt } from '@/lib/prompts';
import { generateDeterministicExplanation } from '@/lib/scoring';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<ExplainRequest>;

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
    }

    if (!body.event || typeof body.event !== 'object' || !body.event.id) {
      return NextResponse.json({ error: 'Missing or invalid event object' }, { status: 400 });
    }

    if (!body.breakdown || typeof body.breakdown !== 'object' || !Array.isArray(body.breakdown.playerBreakdowns)) {
      return NextResponse.json({ error: 'Missing or invalid breakdown object' }, { status: 400 });
    }

    const language = body.language === 'hinglish' ? 'hinglish' : 'en';
    const previousRank = typeof body.previousRank === 'number' ? body.previousRank : 15000;
    const newRank = typeof body.newRank === 'number' ? body.newRank : 15000;
    const rankDelta = previousRank - newRank;

    const fallbackText = generateDeterministicExplanation(body.breakdown, language, rankDelta);

    if (!body.breakdown.affectsUserTeam || body.breakdown.playerBreakdowns.length === 0) {
      const emptyResponse: ExplainResponse = {
        explanation: fallbackText,
        netPoints: 0,
        breakdowns: [],
        isFallback: true,
      };
      return NextResponse.json(emptyResponse);
    }

    const prompt = buildExplainPrompt(body.event, body.breakdown, language, previousRank, newRank);
    const geminiResult = await generateGeminiExplanation(prompt, language);

    const explanation = geminiResult ? geminiResult.text : fallbackText;
    const isFallback = !geminiResult;

    const responsePayload: ExplainResponse = {
      explanation,
      netPoints: body.breakdown.netTeamPointsDelta,
      breakdowns: body.breakdown.playerBreakdowns,
      isFallback,
    };

    return NextResponse.json(responsePayload);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error while processing explanation' },
      { status: 500 },
    );
  }
}
