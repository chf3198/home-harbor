/**
 * @fileoverview AI Search Types - Constants and interfaces for AI-driven search
 * @semantic types, ai, search
 */

export const AISearchActionTypes = {
  SET_LOADING: 'SET_LOADING',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_CHAT: 'CLEAR_CHAT',
  LOAD_FROM_STORAGE: 'LOAD_FROM_STORAGE',
};

export const initialAISearchState = {
  loading: false,
  messages: [], // Array of { role: 'user' | 'assistant', content: string, timestamp: number }
  error: null,
};

export const STORAGE_KEY = 'homeharbor_ai_chat';
