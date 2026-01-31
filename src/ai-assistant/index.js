/**
 * AI Assistant Module
 * 
 * Provides AI chat capabilities using OpenRouter's free LLM models
 * with cascading fallback and retry logic.
 * 
 * @module ai-assistant
 */

const ChatAssistant = require('./chatAssistant');
const OpenRouterClient = require('./openRouterClient');
const ModelSelector = require('./modelSelector');
const CascadingService = require('./cascadingService');
const errors = require('./errors');
const config = require('./config');

module.exports = {
  // Main interface
  ChatAssistant,
  
  // Core components (for advanced usage)
  OpenRouterClient,
  ModelSelector,
  CascadingService,
  
  // Error types
  ...errors,
  
  // Configuration
  config,
  
  // Convenience factory
  createAssistant: () => new ChatAssistant(),
};
