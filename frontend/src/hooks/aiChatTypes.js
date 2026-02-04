/**
 * @fileoverview AI Chat Types and Constants
 */

// Action types
export const AIActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_RESPONSE: 'SET_RESPONSE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_CHAT: 'CLEAR_CHAT',
  SET_AI_READY: 'SET_AI_READY',
};

// Initial state
export const initialState = {
  loading: false,
  response: '',
  error: null,
  aiReady: false,
};