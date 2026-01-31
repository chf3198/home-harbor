const OpenRouterClient = require('./openRouterClient');
const ModelSelector = require('./modelSelector');
const CascadingService = require('./cascadingService');
const { validateConfig } = require('./config');

/**
 * High-level AI chat assistant interface
 * Orchestrates client, selector, and cascading service
 */
class ChatAssistant {
  constructor() {
    // Validate configuration on initialization
    validateConfig();

    this.client = new OpenRouterClient();
    this.selector = new ModelSelector();
    this.cascade = new CascadingService(this.client, this.selector);
    this.conversationHistory = [];
    this.systemPrompt = this._getDefaultSystemPrompt();
  }

  /**
   * Send a message and get AI response
   * @param {string} userMessage - User's message
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} AI response with metadata
   */
  async ask(userMessage, options = {}) {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    // Prepare messages with system prompt
    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...this.conversationHistory,
    ];

    try {
      // Send with cascading fallback
      const result = await this.cascade.sendWithCascade(messages, options);

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: result.response,
      });

      return {
        success: true,
        message: result.response,
        model: result.model,
        attempts: result.attempts,
        retried: result.retried,
      };
    } catch (error) {
      // Don't add failed response to history
      return {
        success: false,
        error: error.message,
        errorType: error.constructor.name,
        attempts: error.attempts || 0,
      };
    }
  }

  /**
   * Ask a one-off question without conversation history
   * @param {string} question - Standalone question
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} AI response
   */
  async askOneOff(question, options = {}) {
    const messages = [
      { role: 'system', content: this.systemPrompt },
      { role: 'user', content: question },
    ];

    try {
      const result = await this.cascade.sendWithCascade(messages, options);

      return {
        success: true,
        message: result.response,
        model: result.model,
        attempts: result.attempts,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorType: error.constructor.name,
      };
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Set custom system prompt
   * @param {string} prompt - System prompt text
   */
  setSystemPrompt(prompt) {
    this.systemPrompt = prompt;
  }

  /**
   * Get current conversation history
   * @returns {Array} Array of message objects
   */
  getHistory() {
    return [...this.conversationHistory];
  }

  /**
   * Get default system prompt for HomeHarbor app
   * @private
   */
  _getDefaultSystemPrompt() {
    return `You are a helpful AI assistant for HomeHarbor, a real estate search and visualization platform.

HomeHarbor helps users:
- Search for homes within a budget in US cities
- Visualize properties on interactive maps
- Filter results by price, location, and property features
- Compare properties side-by-side
- Save favorite listings

When answering questions:
1. Be concise and helpful
2. Reference HomeHarbor's features when relevant
3. Provide actionable guidance for real estate searches
4. If you don't know something specific about the app, say so
5. Focus on helping users achieve their home search goals

Remember: You're here to enhance the user experience, not replace it.`;
  }

  /**
   * Get available models (for debugging/info)
   * @returns {Promise<Array>} Available free models
   */
  async getAvailableModels() {
    try {
      const allModels = await this.client.getModels();
      const freeModels = this.selector.filterFreeModels(allModels);
      const ranked = this.selector.rankModels(freeModels);
      
      return ranked.map(model => ({
        id: model.id,
        name: model.name,
        contextLength: model.context_length,
        score: model.score,
      }));
    } catch (error) {
      throw new Error(`Failed to get available models: ${error.message}`);
    }
  }
}

module.exports = ChatAssistant;
