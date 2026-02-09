/**
 * @fileoverview AI Chat Hook and Provider
 * @semantic hook, ai, property-analysis
 * @intent Provides AI features for property analysis (vision, descriptions)
 */

import { createContext, useContext, useReducer, useCallback } from 'react';
import { AIActionTypes, initialState } from './aiChatTypes.js';
import { aiReducer } from './aiChatReducer.js';

// Context
const AIContext = createContext();

/**
 * API URL configuration for AI features
 * Production: AWS Lambda via API Gateway
 * Development: Vite proxy to local Express backend
 * 
 * Note: Property analysis endpoints are NOT yet deployed to AWS Lambda.
 * These features will fail in production until Lambda handlers are added.
 */
/* global __AWS_API_URL__ */
const AWS_API_BASE = typeof __AWS_API_URL__ !== 'undefined' ? __AWS_API_URL__ : '';
const LOCAL_API_BASE = '/api';

/**
 * Get the appropriate API base URL based on environment
 * @returns {string} API base URL
 */
function getApiBase() {
  return import.meta.env.PROD ? AWS_API_BASE : LOCAL_API_BASE;
}

// Provider component
export function AIProvider({ children }) {
  const [state, dispatch] = useReducer(aiReducer, initialState);

  const sendMessage = useCallback(async (message, propertyId = null) => {
    dispatch({ type: AIActionTypes.SET_LOADING, payload: true });

    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          propertyId,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.statusText}`);
      }

      const data = await response.json();
      dispatch({ type: AIActionTypes.SET_RESPONSE, payload: data.response });
    } catch (error) {
      dispatch({ type: AIActionTypes.SET_ERROR, payload: error.message });
    }
  }, []);

  const analyzeProperty = useCallback(async (propertyId) => {
    dispatch({ type: AIActionTypes.SET_LOADING, payload: true });

    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/ai/analyze/${propertyId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      dispatch({ type: AIActionTypes.SET_RESPONSE, payload: data.analysis });
    } catch (error) {
      dispatch({ type: AIActionTypes.SET_ERROR, payload: error.message });
    }
  }, []);

  const clearChat = useCallback(() => {
    dispatch({ type: AIActionTypes.CLEAR_CHAT });
  }, []);

  const setAiReady = useCallback((ready) => {
    dispatch({ type: AIActionTypes.SET_AI_READY, payload: ready });
  }, []);

  const value = {
    ...state,
    sendMessage,
    analyzeProperty,
    clearChat,
    setAiReady,
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}

// Hook
export function useAIChat() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAIChat must be used within an AIProvider');
  }
  return context;
}