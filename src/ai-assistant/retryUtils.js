/**
 * Retry utilities for cascading service
 * @module retryUtils
 */

const { RateLimitError } = require('./errors');
const { MAX_RETRIES, RETRY_BACKOFF_MS } = require('./config');

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with exponential backoff for rate limits
 * @param {Object} client - OpenRouter client
 * @param {string} model - Model ID to retry
 * @param {Array} messages - Chat messages
 * @param {Object} options - Request options
 * @param {number} initialRetryAfter - Initial retry delay
 * @returns {Promise<Object|null>} Response or null if all retries failed
 */
async function retryWithBackoff(client, model, messages, options, initialRetryAfter) {
  let retryAfter = initialRetryAfter || RETRY_BACKOFF_MS;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    await sleep(retryAfter);

    try {
      const response = await client.sendChatMessage(model, messages, options);
      return response;
    } catch (error) {
      if (error instanceof RateLimitError) {
        retryAfter = error.retryAfter || (retryAfter * 2);
        continue;
      }
      return null;
    }
  }

  return null;
}

/**
 * Execute request with retry logic for a specific model
 * @param {Object} client - OpenRouter client
 * @param {string} modelId - Model to use
 * @param {Array} messages - Chat messages
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response with metadata
 */
async function executeWithRetry(client, modelId, messages, options = {}) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.sendChatMessage(modelId, messages, options);
      return {
        success: true,
        model: modelId,
        response: response.choices[0].message.content,
        fullResponse: response,
        attempts: attempt,
      };
    } catch (error) {
      lastError = error;

      if (error instanceof RateLimitError) {
        const backoff = error.retryAfter || (RETRY_BACKOFF_MS * attempt);
        await sleep(backoff);
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

module.exports = {
  sleep,
  retryWithBackoff,
  executeWithRetry,
};
