
/**
 * Custom errors for AI assistant service
 */

class NoAvailableModelsError extends Error {
  constructor(message = 'No available models found') {
    super(message);
    this.name = 'NoAvailableModelsError';
  }
}

class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded', retryAfter = null) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

class ModelTimeoutError extends Error {
  constructor(model, timeout) {
    super(`Model ${model} timed out after ${timeout}ms`);
    this.name = 'ModelTimeoutError';
    this.model = model;
    this.timeout = timeout;
  }
}

class InvalidResponseError extends Error {
  constructor(message = 'Invalid response from API') {
    super(message);
    this.name = 'InvalidResponseError';
  }
}

class NetworkError extends Error {
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

class AllModelsFailedError extends Error {
  constructor(message, attempts = []) {
    // Handle both signatures: (attempts) and (message, attempts)
    if (Array.isArray(message)) {
      attempts = message;
      const modelList = attempts.map(a => a.model).join(', ');
      message = `All models failed: ${modelList}`;
    }
    super(message);
    this.name = 'AllModelsFailedError';
    this.attempts = attempts;
  }
}

class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

module.exports = {
  NoAvailableModelsError,
  RateLimitError,
  ModelTimeoutError,
  InvalidResponseError,
  NetworkError,
  AllModelsFailedError,
  ConfigurationError,
};
