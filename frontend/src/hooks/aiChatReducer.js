/**
 * @fileoverview AI Chat Reducer
 */

import { AIActionTypes } from './aiChatTypes.js';

// Reducer function
export function aiReducer(state, action) {
  switch (action.type) {
    case AIActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case AIActionTypes.SET_RESPONSE:
      return { ...state, response: action.payload, loading: false, error: null };
    case AIActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case AIActionTypes.CLEAR_CHAT:
      return { ...state, response: '', error: null };
    case AIActionTypes.SET_AI_READY:
      return { ...state, aiReady: action.payload };
    default:
      return state;
  }
}