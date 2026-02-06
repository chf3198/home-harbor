/**
 * @fileoverview Chat Lambda - Two-LLM architecture for AI search integration
 * @semantic lambda, chat, openrouter, ai, search
 * @intent LLM #1 extracts search filters, LLM #2 generates conversational response
 */

import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { ChatRequest, ChatResponse, SearchFilters } from './chat-types';
import { extractJSON, normalizeFilters, hasFilters, formatFiltersForPrompt } from './chat-filters';
import { callLLM } from './chat-llm';
import { FILTER_EXTRACTION_PROMPT, buildConversationPrompt } from './chat-prompts';

const secretsClient = new SecretsManagerClient({});
const SECRETS_NAME = process.env.SECRETS_NAME || 'home-harbor/openrouter';

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
    const body: ChatRequest = JSON.parse(event.body || '{}');
    const { message, searchResults = [] } = body;

    if (!message || typeof message !== 'string') {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    // Get API key
    const secretCommand = new GetSecretValueCommand({ SecretId: SECRETS_NAME });
    const secret = await secretsClient.send(secretCommand);
    const secrets = JSON.parse(secret.SecretString || '{}');
    const apiKey = secrets.openrouter_api_key;

    if (!apiKey) throw new Error('OpenRouter API key not configured');

    // LLM #1: Extract search filters
    const filterPrompt = FILTER_EXTRACTION_PROMPT + message;
    const filterResult = await callLLM(apiKey, filterPrompt);
    const rawFilters = extractJSON(filterResult.content);
    const filters = normalizeFilters(rawFilters);

    // LLM #2: Generate conversational response
    const priceRange = searchResults.length > 0
      ? `$${Math.min(...searchResults.map((r: any) => r.price || 0)).toLocaleString()} - $${Math.max(...searchResults.map((r: any) => r.price || 0)).toLocaleString()}`
      : 'N/A';

    const conversationPrompt = buildConversationPrompt(
      message,
      formatFiltersForPrompt(filters),
      searchResults.length,
      priceRange
    );
    const conversationResult = await callLLM(apiKey, conversationPrompt);

    // Build response
    const response: ChatResponse = {
      filters: hasFilters(filters) ? filters : null,
      response: conversationResult.content.trim(),
      model: filterResult.model,
    };

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Chat error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'AI service temporarily unavailable' }),
    };
  }
};
