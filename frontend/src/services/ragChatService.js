/**
 * @fileoverview RAG-enhanced AI chat service
 * @description Combines semantic search with LLM for property Q&A
 * @semantic rag, chat, ai, openrouter
 */

/**
 * Build RAG prompt with property context
 * @param {string} userQuery - User's question
 * @param {string} propertyContext - Context from semantic search
 * @returns {string} Enhanced prompt for LLM
 */
export function buildRAGPrompt(userQuery, propertyContext) {
  return `You are a helpful real estate assistant. Answer the user's question based on the following property listings.

PROPERTY DATA:
${propertyContext}

USER QUESTION: ${userQuery}

Provide a helpful, accurate response based on the property data above. If the data doesn't contain enough information to answer, say so clearly.`;
}

/**
 * Send RAG-enhanced message to OpenRouter
 * @param {string} query - User query
 * @param {string} context - Property context from semantic search
 * @param {string} [apiBase] - API base URL
 * @returns {Promise<Object>} AI response
 */
export async function sendRAGMessage(query, context, apiBase = '/api') {
  const prompt = buildRAGPrompt(query, context);

  const response = await fetch(`${apiBase}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: prompt }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * RAG response type definition
 * @typedef {Object} RAGResponse
 * @property {boolean} success - Whether request succeeded
 * @property {string} response - AI response text
 * @property {Object[]} sources - Source properties used
 * @property {string} model - Model used for response
 */

/**
 * Process RAG response with source attribution
 * @param {Object} aiResponse - Raw AI response
 * @param {Object[]} searchResults - Properties used as context
 * @returns {RAGResponse} Processed response with sources
 */
export function processRAGResponse(aiResponse, searchResults) {
  return {
    success: true,
    response: aiResponse.response || aiResponse.message,
    sources: searchResults.slice(0, 5).map((r) => ({
      id: r.id,
      address: r.address,
      city: r.city,
      score: r.relevanceScore || r.score,
    })),
    model: aiResponse.model || 'unknown',
  };
}
