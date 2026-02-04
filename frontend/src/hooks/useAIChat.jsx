/**
 * @fileoverview AI Chat Hook and Provider
 */

import { createContext, useContext, useReducer, useCallback } from 'react';
import { AIActionTypes, initialState } from './aiChatTypes.js';
import { aiReducer } from './aiChatReducer.js';

// Context
const AIContext = createContext();

// Provider component
export function AIProvider({ children }) {
  const [state, dispatch] = useReducer(aiReducer, initialState);

  const sendMessage = useCallback(async (message, propertyId = null) => {
    dispatch({ type: AIActionTypes.SET_LOADING, payload: true });

    try {
      const response = await fetch('/api/ai/chat', {
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
      const response = await fetch(`/api/ai/analyze/${propertyId}`, {
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