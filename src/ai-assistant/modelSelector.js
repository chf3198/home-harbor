const { NoAvailableModelsError } = require('./errors');

/**
 * Model selection and ranking logic
 * Filters free models and ranks them by quality criteria
 */
class ModelSelector {
  /**
   * Filter models to only free ones (pricing.prompt = "0")
   * @param {Array} models - Array of model objects from OpenRouter API
   * @returns {Array} Filtered array of free models
   */
  filterFreeModels(models) {
    if (!models || !Array.isArray(models)) {
      return [];
    }

    return models.filter(model => {
      // Check if pricing exists and prompt price is "0" (free)
      if (!model.pricing || model.pricing.prompt !== '0') {
        return false;
      }

      // Exclude expired models
      if (model.expirationDate) {
        const expirationDate = new Date(model.expirationDate);
        const now = new Date();
        if (expirationDate < now) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Calculate model score based on quality criteria
   * @param {Object} model - Model object
   * @returns {number} Score (higher is better)
   */
  calculateScore(model) {
    let score = 0;

    // 1. Context window (most important - 40 points max)
    const contextLength = model.context_length || 0;
    if (contextLength >= 100000) score += 40;
    else if (contextLength >= 50000) score += 30;
    else if (contextLength >= 32000) score += 20;
    else if (contextLength >= 16000) score += 10;
    else score += 5;

    // 2. Capabilities (30 points max)
    const capabilities = [];
    if (model.architecture?.modality?.includes('text->text')) {
      capabilities.push('text');
    }
    if (model.architecture?.modality?.includes('image')) {
      capabilities.push('multimodal');
      score += 10;
    }
    if (model.function_calling) {
      capabilities.push('function_calling');
      score += 10;
    }
    if (model.structured_outputs) {
      capabilities.push('structured_outputs');
      score += 10;
    }

    // 3. Privacy (20 points max)
    // Prefer models that don't log prompts
    if (model.privacy_policy) {
      if (model.privacy_policy.includes('no-log') || 
          model.privacy_policy.includes('anonymous')) {
        score += 20;
      } else if (!model.privacy_policy.includes('training')) {
        score += 10;
      }
    }

    // 4. Expiration date penalty (10 points max)
    // Prefer models without expiration or far expiration
    if (!model.expirationDate) {
      score += 10;
    } else {
      const daysUntilExpiration = Math.floor(
        (new Date(model.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiration > 90) score += 8;
      else if (daysUntilExpiration > 30) score += 5;
      else if (daysUntilExpiration > 7) score += 2;
    }

    return score;
  }

  /**
   * Rank models by quality score
   * @param {Array} models - Array of model objects
   * @returns {Array} Sorted array (best first)
   */
  rankModels(models) {
    if (!models || !Array.isArray(models) || models.length === 0) {
      return [];
    }

    return models
      .map(model => ({
        ...model,
        score: this.calculateScore(model),
      }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Select best available free model from list
   * @param {Array} models - Array of all available models
   * @returns {Object} Best free model
   * @throws {NoAvailableModelsError} If no free models available
   */
  selectBestModel(models) {
    const freeModels = this.filterFreeModels(models);
    
    if (freeModels.length === 0) {
      throw new NoAvailableModelsError('No free models available');
    }

    const rankedModels = this.rankModels(freeModels);
    return rankedModels[0];
  }

  /**
   * Get ordered list of free models for cascading
   * @param {Array} models - Array of all available models
   * @param {number} limit - Maximum number of models to return (default: 5)
   * @returns {Array} Ordered array of best free models
   * @throws {NoAvailableModelsError} If no free models available
   */
  getCascadeOrder(models, limit = 5) {
    const freeModels = this.filterFreeModels(models);
    
    if (freeModels.length === 0) {
      throw new NoAvailableModelsError('No free models available for cascade');
    }

    const rankedModels = this.rankModels(freeModels);
    return rankedModels.slice(0, limit);
  }
}

module.exports = ModelSelector;
