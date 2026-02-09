/**
 * @fileoverview OpenRouter LLM client with cascading fallback
 * @semantic llm, openrouter, api
 */

import { OpenRouterResponse } from './chat-types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Free models optimized for conversational AI and domain knowledge
 * Ordered by reliability/speed for dual-LLM architecture (filter + conversation)
 */
export const PRIMARY_MODEL = 'stepfun/step-3.5-flash:free'; // Fast, 196B MoE
export const FALLBACK_MODELS = [
  'arcee-ai/trinity-large-preview:free',   // 400B MoE, creative + agentic
  'tngtech/deepseek-r1t-chimera:free',     // DeepSeek R1 reasoning
  'nvidia/nemotron-3-nano-30b-a3b:free',   // NVIDIA's latest
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
