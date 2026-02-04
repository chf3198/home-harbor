const { ModelTimeoutError, AllModelsFailedError, RateLimitError } = require('./errors');
const { sleep, retryWithBackoff, executeWithRetry } = require('./retryUtils');

/**
 * Cascading retry service - attempts requests across multiple models
 */
class CascadingService {
  constructor(client, modelSelector) {
    this.client = client;
    this.modelSelector = modelSelector;
  }

  /**
   * Send chat message with cascading fallback through models
   * @param {Array} messages - Chat messages
   * @param {Object} options - Additional options
   * @param {number} timeoutMs - Timeout per model (default: 30000)
   * @returns {Promise<Object>} Chat response with metadata
   */
  async sendWithCascade(messages, options = {}, timeoutMs = 30000) {
    const allModels = await this.client.getModels();
    const orderedModels = this.modelSelector.getCascadeOrder(allModels);
    const attempts = [];

    for (const model of orderedModels) {
      try {
        const response = await this._attemptWithTimeout(model.id, messages, options, timeoutMs);
        return this._buildSuccessResponse(model.id, response, attempts.length + 1);
      } catch (error) {
        attempts.push(this._recordAttempt(model.id, error));

        if (error instanceof RateLimitError) {
          const retried = await retryWithBackoff(
            this.client, model.id, messages, options, error.retryAfter
          );
          if (retried) {
            return this._buildSuccessResponse(model.id, retried, attempts.length + 1, true);
          }
        }
      }
    }

    throw new AllModelsFailedError(`All ${orderedModels.length} models failed`, attempts);
  }

  /** @private */
  async _attemptWithTimeout(model, messages, options, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new ModelTimeoutError(`Model ${model} timed out after ${timeoutMs}ms`, model, timeoutMs));
      }, timeoutMs);

      this.client.sendChatMessage(model, messages, options)
        .then(response => { clearTimeout(timer); resolve(response); })
        .catch(error => { clearTimeout(timer); reject(error); });
    });
  }

  /** @private */
  _buildSuccessResponse(modelId, response, attempts, retried = false) {
    return {
      success: true,
      model: modelId,
      response: response.choices[0].message.content,
      fullResponse: response,
      attempts,
      ...(retried && { retried: true }),
    };
  }

  /** @private */
  _recordAttempt(modelId, error) {
    return {
      model: modelId,
      error: error.constructor.name,
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Send a single request with retry logic (no cascade)
   * @param {string} modelId - Model to use
   * @param {Array} messages - Chat messages
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Chat response
   */
  async sendWithRetry(modelId, messages, options = {}) {
    return executeWithRetry(this.client, modelId, messages, options);
  }
}

module.exports = CascadingService;
