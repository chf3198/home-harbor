/**
 * @fileoverview OpenRouter LLM client with cascading fallback
 * @semantic llm, openrouter, api
 */

import { OpenRouterResponse } from './chat-types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Primary model - supports both structured output and conversation
export const PRIMARY_MODEL = 'arcee-ai/trinity-large-preview:free';
export const FALLBACK_MODELS = [
  'tngtech/deepseek-r1t-chimera:free',
  'stepfun/step-3.5-flash:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
];

/**
 * Call OpenRouter API with cascading model fallback
 */
export async function callLLM(
  apiKey: string,
  prompt: string,
  models: string[] = [PRIMARY_MODEL, ...FALLBACK_MODELS]
): Promise<{ content: string; model: string }> {
  for (const model of models) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://homeharbor.demo',
          'X-Title': 'HomeHarbor',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        console.log(`Model ${model} failed: ${response.status}`);
        continue;
      }

      const data = (await response.json()) as OpenRouterResponse;
      const content = data.choices?.[0]?.message?.content || '';
      if (content) {
        return { content, model: data.model || model };
      }
    } catch (err) {
      console.log(`Model ${model} error:`, err);
    }
  }
  throw new Error('All AI models unavailable');
}
