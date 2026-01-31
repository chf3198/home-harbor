const {
  ModelTimeoutError,
  RateLimitError,
  AllModelsFailedError,
} = require('./errors');

const { MAX_RETRIES, RETRY_BACKOFF_MS } = require('./config');

/**
 * Cascading retry service
 * Attempts requests across multiple models with timeout and retry logic
 */
class CascadingService {
  constructor(client, modelSelector) {
    this.client = client;
    this.modelSelector = modelSelector;
    this.maxRetries = MAX_RETRIES;
    this.retryBackoffMs = RETRY_BACKOFF_MS;
  }

  /**
   * Send chat message with cascading fallback through models
   * @param {Array} messages - Chat messages
   * @param {Object} options - Additional options (temperature, etc.)
   * @param {number} timeoutMs - Timeout per model attempt (default: 30000)
   * @returns {Promise<Object>} Chat response with metadata
   * @throws {AllModelsFailedError} If all models fail
   */
  async sendWithCascade(messages, options = {}, timeoutMs = 30000) {
    // Get available models
    const allModels = await this.client.getModels();
    const orderedModels = this.modelSelector.getCascadeOrder(allModels);

    const attempts = [];
    
    for (const model of orderedModels) {
      try {
        const response = await this._attemptWithTimeout(
          model.id,
          messages,
          options,
          timeoutMs
        );

        // Success - return response with metadata
        return {
          success: true,
          model: model.id,
          response: response.choices[0].message.content,
          fullResponse: response,
          attempts: attempts.length + 1,
        };
      } catch (error) {
        // Record failed attempt
        attempts.push({
          model: model.id,
          error: error.constructor.name,
          message: error.message,
          timestamp: new Date().toISOString(),
        });

        // If it's a rate limit, try exponential backoff retry
        if (error instanceof RateLimitError) {
          const retried = await this._retryWithBackoff(
            model.id,
            messages,
            options,
            error.retryAfter
          );
          
          if (retried) {
            return {
              success: true,
              model: model.id,
              response: retried.choices[0].message.content,
              fullResponse: retried,
              attempts: attempts.length + 1,
              retried: true,
            };
          }
        }

        // Continue to next model
        continue;
      }
    }

    // All models failed
    throw new AllModelsFailedError(
      `All ${orderedModels.length} models failed to respond`,
      attempts
    );
  }

  /**
   * Attempt chat completion with timeout
   * @private
   */
  async _attemptWithTimeout(model, messages, options, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new ModelTimeoutError(
          `Model ${model} timed out after ${timeoutMs}ms`,
          model,
          timeoutMs
        ));
      }, timeoutMs);

      this.client.sendChatMessage(model, messages, options)
        .then(response => {
          clearTimeout(timer);
          resolve(response);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Retry with exponential backoff for rate limits
   * @private
   */
  async _retryWithBackoff(model, messages, options, initialRetryAfter) {
    let retryAfter = initialRetryAfter || this.retryBackoffMs;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      // Wait before retry
      await this._sleep(retryAfter);

      try {
        const response = await this.client.sendChatMessage(model, messages, options);
        return response; // Success
      } catch (error) {
        if (error instanceof RateLimitError) {
          // Exponential backoff
          retryAfter = error.retryAfter || (retryAfter * 2);
          continue;
        }
        
        // Different error - give up on this model
        return null;
      }
    }

    // Max retries exceeded
    return null;
  }

  /**
   * Sleep for specified milliseconds
   * @private
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Send a single request with retry logic (no cascade)
   * Useful for specific model requests
   * @param {string} modelId - Specific model to use
   * @param {Array} messages - Chat messages
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Chat response
   */
  async sendWithRetry(modelId, messages, options = {}) {
    let lastError;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.client.sendChatMessage(modelId, messages, options);
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
          const backoff = error.retryAfter || (this.retryBackoffMs * attempt);
          await this._sleep(backoff);
          continue;
        }

        // Non-retryable error
        throw error;
      }
    }

    // Max retries exceeded
    throw lastError;
  }
}

module.exports = CascadingService;
