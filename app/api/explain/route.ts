import { NextRequest, NextResponse } from 'next/server';
import { ExplainRequest, ExplainResponse } from '@/types/api';
import { generateGeminiExplanation } from '@/lib/gemini';
import { buildExplainPrompt } from '@/lib/prompts';
import { generateDeterministicExplanation } from '@/lib/scoring';
import { checkRateLimit, sanitizeText } from '@/lib/security';

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

    const body = (await req.json()) as Partial<ExplainRequest>;

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
    }

    if (!body.event || typeof body.event !== 'object' || !body.event.id) {
      return NextResponse.json({ error: 'Missing or invalid event object' }, { status: 400 });
    }

    if (
      !body.breakdown ||
      typeof body.breakdown !== 'object' ||
      !Array.isArray(body.breakdown.playerBreakdowns) ||
      body.breakdown.playerBreakdowns.length > 11
    ) {
      return NextResponse.json({ error: 'Missing or invalid breakdown object' }, { status: 400 });
    }

    const sanitizedEvent = {
      ...body.event,
      description: sanitizeText(body.event.description || '', 200),
      batsmanName: sanitizeText(body.event.batsmanName || '', 50),
      bowlerName: sanitizeText(body.event.bowlerName || '', 50),
    };

    const sanitizedBreakdowns = body.breakdown.playerBreakdowns.map((p) => ({
      ...p,
      playerName: sanitizeText(p.playerName, 50),
      role: sanitizeText(p.role, 10),
      reasons: Array.isArray(p.reasons) ? p.reasons.map((r) => sanitizeText(r, 60)) : [],
    }));

    const sanitizedBreakdown = {
      ...body.breakdown,
      playerBreakdowns: sanitizedBreakdowns,
    };

    const language = body.language === 'hinglish' ? 'hinglish' : 'en';
    const previousRank = typeof body.previousRank === 'number' ? body.previousRank : 15000;
    const newRank = typeof body.newRank === 'number' ? body.newRank : 15000;
    const rankDelta = previousRank - newRank;

    const fallbackText = generateDeterministicExplanation(sanitizedBreakdown, language, rankDelta);

    if (!sanitizedBreakdown.affectsUserTeam || sanitizedBreakdown.playerBreakdowns.length === 0) {
      const emptyResponse: ExplainResponse = {
        explanation: fallbackText,
        netPoints: 0,
        breakdowns: [],
        isFallback: true,
      };
      return NextResponse.json(emptyResponse);
    }

    const prompt = buildExplainPrompt(
      sanitizedEvent,
      sanitizedBreakdown,
      language,
      previousRank,
      newRank,
    );
    const geminiResult = await generateGeminiExplanation(prompt, language);

    const explanation = geminiResult ? geminiResult.text : fallbackText;
    const isFallback = !geminiResult;

    const responsePayload: ExplainResponse = {
      explanation,
      netPoints: sanitizedBreakdown.netTeamPointsDelta,
      breakdowns: sanitizedBreakdown.playerBreakdowns,
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
