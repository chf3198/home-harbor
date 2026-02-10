/**
 * @fileoverview AI Search Hook - Integrates AI chat with property search
 * @semantic hook, ai, search, integration
 * @intent Coordinates LLM calls with search form updates and results display
 */

import { useReducer, useCallback, useEffect } from 'react';
import { AISearchActionTypes, initialAISearchState } from './aiSearchTypes.js';
import { aiSearchReducer } from './aiSearchReducer.js';
import { saveChatHistory, loadChatHistory, saveResults } from './aiSearchStorage.js';

/**
 * Chat API URL configuration
 * - Production: AWS Lambda via API Gateway (secure, API key in Secrets Manager)
 * - Development: Vite proxy to local Express backend
 * 
 * __AWS_API_URL__ is defined in vite.config.js at build time
 */
/* global __AWS_API_URL__ */
const AWS_CHAT_API = `${typeof __AWS_API_URL__ !== 'undefined' ? __AWS_API_URL__ : ''}/chat`;
const LOCAL_CHAT_API = '/api/chat';

/**
 * Get the appropriate chat API URL based on environment
 * - Production (GitHub Pages): Uses AWS Lambda via API Gateway
 * - Local development: Uses Vite proxy to Express backend
 * @returns {string} Chat API URL
 */
function getChatApiUrl() {
  // Vite sets import.meta.env.PROD = true for production builds
  const isProduction = import.meta.env.PROD;
  return isProduction ? AWS_CHAT_API : LOCAL_CHAT_API;
}

/**
 * Custom hook for AI-powered property search
 * @param {Function} onFiltersExtracted - Callback when AI extracts filters
 * @param {Array} searchResults - Current search results for context
 */
export function useAISearch(onFiltersExtracted, searchResults = []) {
  const [state, dispatch] = useReducer(aiSearchReducer, initialAISearchState);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const history = loadChatHistory();
    if (history.length > 0) {
      dispatch({ type: AISearchActionTypes.LOAD_FROM_STORAGE, payload: history });
    }
  }, []);

  // Save chat history whenever messages change
  useEffect(() => {
    if (state.messages.length > 0) {
      saveChatHistory(state.messages);
    }
  }, [state.messages]);

  const sendMessage = useCallback(async (message) => {
    // Add user message immediately
    const userMessage = { role: 'user', content: message, timestamp: Date.now() };
    dispatch({ type: AISearchActionTypes.ADD_MESSAGE, payload: userMessage });
    dispatch({ type: AISearchActionTypes.SET_LOADING, payload: true });

    try {
      const chatApiUrl = getChatApiUrl();
      const response = await fetch(chatApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          chatHistory: state.messages,
          searchResults,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.statusText}`);
      }

      const data = await response.json();

      // ALWAYS trigger search if filters are returned (alwaysSearch flag)
      // This ensures any property-related query initiates a search
      if (data.filters && onFiltersExtracted) {
        console.log('[useAISearch] Triggering search with filters:', data.filters);
        console.log('[useAISearch] Search intent:', data.searchIntent);
        console.log('[useAISearch] Suggested towns:', data.suggestedTowns);
        onFiltersExtracted(data.filters);
      }

      // Add AI response with additional metadata
      const aiMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: Date.now(),
        filters: data.filters,
        model: data.model,
        searchIntent: data.searchIntent,
        suggestedTowns: data.suggestedTowns,
      };
      dispatch({ type: AISearchActionTypes.ADD_MESSAGE, payload: aiMessage });
    } catch (error) {
      dispatch({ type: AISearchActionTypes.SET_ERROR, payload: error.message });
    }
  }, [state.messages, searchResults, onFiltersExtracted]);

  const clearChat = useCallback(() => {
    dispatch({ type: AISearchActionTypes.CLEAR_CHAT });
    saveChatHistory([]);
    // Also clear results to keep state synchronized - prevents orphaned results on reload
    saveResults([]);
    console.log('[useAISearch] Chat and results cleared');
  }, []);

  return {
    messages: state.messages,
    loading: state.loading,
    error: state.error,
    sendMessage,
    clearChat,
  };
}
