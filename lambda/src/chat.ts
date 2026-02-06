/**
 * @fileoverview Chat Lambda - AI assistant for real estate queries
 * @semantic lambda, chat, openrouter, ai
 */

import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

// OpenRouter API response types
interface OpenRouterResponse {
  choices?: Array<{ message?: { content?: string } }>;
  model?: string;
}

interface OpenRouterError {
  error?: { message?: string };
}

const secretsClient = new SecretsManagerClient({});
const SECRETS_NAME = process.env.SECRETS_NAME || 'home-harbor/openrouter';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Free models to try in order (cascading fallback)
const FREE_MODELS = [
  'google/gemma-3-27b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free', 
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'mistralai/mistral-7b-instruct:free',
];

// Note: Some models don't support system prompts, so we embed context in user message
const CONTEXT_PREFIX = `[You are HomeHarbor AI, a helpful real estate assistant for Connecticut properties. Be concise, helpful, and professional.]\n\nUser: `;

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const handler = async (event: any) => {
  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  try {
    const { message } = JSON.parse(event.body || '{}');

    if (!message || typeof message !== 'string') {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    // Get API key from Secrets Manager
    const secretCommand = new GetSecretValueCommand({ SecretId: SECRETS_NAME });
    const secret = await secretsClient.send(secretCommand);
    const secrets = JSON.parse(secret.SecretString || '{}');
    const apiKey = secrets.openrouter_api_key;

    if (!apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    // Try each model in cascade until one works
    let lastError: Error | null = null;
    
    for (const model of FREE_MODELS) {
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
            messages: [
              { role: 'user', content: CONTEXT_PREFIX + message },
            ],
            max_tokens: 1024,
          }),
        });

        if (!response.ok) {
          const errorData = (await response.json().catch(() => ({}))) as OpenRouterError;
          console.log(`Model ${model} failed: ${errorData.error?.message}`);
          lastError = new Error(errorData.error?.message || `API error: ${response.status}`);
          continue; // Try next model
        }

        const data = (await response.json()) as OpenRouterResponse;
        const reply = data.choices?.[0]?.message?.content || 'No response generated';

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            message: reply,
            model: data.model || model,
          }),
        };
      } catch (err) {
        console.log(`Model ${model} error:`, err);
        lastError = err as Error;
        continue; // Try next model
      }
    }

    // All models failed
    throw lastError || new Error('All AI models unavailable');
  } catch (error) {
    console.error('Chat error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'AI service temporarily unavailable' }),
    };
  }
};
