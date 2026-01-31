const {
  OPENROUTER_API_KEY,
  OPENROUTER_BASE_URL,
  DEFAULT_TIMEOUT,
  APP_HEADERS,
} = require('./config');

const {
  NetworkError,
  RateLimitError,
  InvalidResponseError,
} = require('./errors');

/**
 * HTTP client for OpenRouter API
 * Handles communication with /api/v1/models and /api/v1/chat/completions endpoints
 */
class OpenRouterClient {
  constructor(apiKey = OPENROUTER_API_KEY, baseUrl = OPENROUTER_BASE_URL) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.timeout = DEFAULT_TIMEOUT;
  }

  /**
   * Fetch all available models from OpenRouter
   * @returns {Promise<Array>} Array of model objects
   * @throws {NetworkError} If network request fails
   * @throws {InvalidResponseError} If response is not valid JSON
   * @throws {RateLimitError} If rate limit is exceeded
   */
  async getModels() {
    const url = `${this.baseUrl}/models`;
    
    try {
      const response = await this._fetchWithTimeout(url, {
        method: 'GET',
        headers: this._getHeaders(),
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new RateLimitError(
          'Rate limit exceeded for /models endpoint',
          retryAfter ? parseInt(retryAfter, 10) * 1000 : 60000
        );
      }

      if (!response.ok) {
        throw new NetworkError(
          `Failed to fetch models: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new InvalidResponseError(
          'Invalid response format: expected { data: [...] }'
        );
      }

      return data.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new NetworkError(`Request timed out after ${this.timeout}ms`);
      }
      
      if (error instanceof RateLimitError || 
          error instanceof NetworkError || 
          error instanceof InvalidResponseError) {
        throw error;
      }

      throw new NetworkError(`Network error: ${error.message}`);
    }
  }

  /**
   * Send a chat completion request to OpenRouter
   * @param {string} model - Model ID (e.g., "arcee-ai/trinity-large-preview:free")
   * @param {Array} messages - Array of message objects { role, content }
   * @param {Object} options - Additional options (temperature, max_tokens, etc.)
   * @returns {Promise<Object>} Chat completion response
   * @throws {NetworkError} If network request fails
   * @throws {InvalidResponseError} If response is not valid JSON
   * @throws {RateLimitError} If rate limit is exceeded
   */
  async sendChatMessage(model, messages, options = {}) {
    const url = `${this.baseUrl}/chat/completions`;
    
    const body = {
      model,
      messages,
      ...options,
    };

    try {
      const response = await this._fetchWithTimeout(url, {
        method: 'POST',
        headers: this._getHeaders(),
        body: JSON.stringify(body),
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new RateLimitError(
          `Rate limit exceeded for model: ${model}`,
          retryAfter ? parseInt(retryAfter, 10) * 1000 : 60000
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error?.message || response.statusText;
        throw new NetworkError(
          `Chat completion failed (${response.status}): ${errorMessage}`
        );
      }

      const data = await response.json();
      
      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        throw new InvalidResponseError(
          'Invalid response format: expected { choices: [...] }'
        );
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new NetworkError(`Request timed out after ${this.timeout}ms`);
      }
      
      if (error instanceof RateLimitError || 
          error instanceof NetworkError || 
          error instanceof InvalidResponseError) {
        throw error;
      }

      throw new NetworkError(`Network error: ${error.message}`);
    }
  }

  /**
   * Fetch with timeout support
   * @private
   */
  async _fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Get request headers
   * @private
   */
  _getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...APP_HEADERS,
    };
  }
}

module.exports = OpenRouterClient;
