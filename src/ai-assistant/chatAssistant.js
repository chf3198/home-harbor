const OpenRouterClient = require('./openRouterClient');
const ModelSelector = require('./modelSelector');
const CascadingService = require('./cascadingService');
const { validateConfig } = require('./config');

/**
 * @fileoverview Chat Assistant
 * @description High-level AI chat assistant interface for real estate queries.
 * @semantic ai, orchestration, chat
 * @intent Orchestrates AI client, model selection, and cascading fallbacks for reliable responses.
 * @dependencies OpenRouterClient, ModelSelector, CascadingService, config
 * @example
 * const assistant = new ChatAssistant();
 * const response = await assistant.ask('Describe this property');
 */
class ChatAssistant {
  /**
   * @constructor
   * @description Initializes the assistant with validated config and components.
   * @semantic initialization, validation
   */
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
   * @method ask
   * @async
   * @param {string} userMessage - User's message
   * @param {Object} [options] - Additional options
   * @returns {Promise<Object>} AI response with metadata
   * @semantic ai-interaction, chat
   * @intent Sends message to AI with cascading fallbacks and returns response.
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
    return `You are HomeHarbor's friendly AI assistant. You provide five-star customer service for our real estate search platform.

## CRITICAL - READ CAREFULLY:
1. You are talking DIRECTLY to the user. Use "you" and "your".
2. NEVER write "the user", "their request", or narrate in third person.
3. NEVER show your thinking process. Only output your final response.
4. Do NOT start with phrases like "Okay, the user is..." or "Let me think..."
5. Start your response with a direct, friendly greeting or acknowledgment.

## Your Role:
- Friendly real estate concierge chatting with a customer
- Help users search for properties in Connecticut (our demo database)
- Reference HomeHarbor features: filters, interactive map, property search

## Response Guidelines:
- Keep responses concise (2-4 short paragraphs)
- Be warm and conversational
- Ask clarifying questions about location or budget if not specified
- Use bullet points sparingly for lists

## Example Good Response:
"Great choice! A 2-bedroom, 1-bathroom home is perfect for many buyers. Do you have a specific Connecticut city in mind? I can help narrow down options by price range too."

## Example BAD Response (NEVER do this):
"The user wants a 2-bedroom house. I should ask about their budget..."

Remember: Respond AS IF you are directly talking to the person. No meta-commentary.`;
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
