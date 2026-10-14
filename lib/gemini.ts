import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPTS } from './prompts';
import { AppLanguage } from '@/types/api';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const API_TIMEOUT_MS = 8000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export async function generateGeminiExplanation(
  prompt: string,
  language: AppLanguage,
): Promise<{ text: string } | null> {
  const client = getGeminiClient();
  if (!client) {
    return null;
  }

  const systemInstruction = SYSTEM_PROMPTS[language];
  let timerId: NodeJS.Timeout | undefined;

  try {
    const timeoutPromise = new Promise<null>((_, reject) => {
      timerId = setTimeout(() => reject(new Error('Gemini API request timed out')), API_TIMEOUT_MS);
    });

    const apiPromise = client.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
        maxOutputTokens: 250,
      },
    });

    const response = (await Promise.race([apiPromise, timeoutPromise])) as Awaited<
      typeof apiPromise
    >;

    const outputText = response.text?.trim();
    if (!outputText) {
      return null;
    }

    return { text: outputText };
  } catch {
    return null;
  } finally {
    if (timerId) clearTimeout(timerId);
  }
}

export async function streamGeminiCatchUp(
  prompt: string,
  language: AppLanguage,
  fallbackText: string,
): Promise<ReadableStream<Uint8Array>> {
  const client = getGeminiClient();
  const encoder = new TextEncoder();

  if (!client) {
    return createMockStream(fallbackText, encoder);
  }

  const systemInstruction = SYSTEM_PROMPTS[language];
  let timerId: NodeJS.Timeout | undefined;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timerId = setTimeout(() => reject(new Error('Catch-up API timeout')), API_TIMEOUT_MS);
    });

    const streamPromise = client.models.generateContentStream({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
        maxOutputTokens: 500,
      },
    });

    const stream = await Promise.race([streamPromise, timeoutPromise]);

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const chunkText = chunk.text;
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch {
          controller.enqueue(encoder.encode('\n\n' + fallbackText));
          controller.close();
        }
      },
    });
  } catch {
    return createMockStream(fallbackText, encoder);
  } finally {
    if (timerId) clearTimeout(timerId);
  }
}

function createMockStream(text: string, encoder: TextEncoder): ReadableStream<Uint8Array> {
  const words = text.split(' ');
  return new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(word + ' '));
        await new Promise((resolve) => setTimeout(resolve, 35));
      }
      controller.close();
    },
  });
}
