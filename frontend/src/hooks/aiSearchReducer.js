/**
 * @fileoverview AI Search Reducer - State management for AI chat
 * @semantic reducer, ai, search
 */

import { AISearchActionTypes } from './aiSearchTypes.js';

export function aiSearchReducer(state, action) {
  switch (action.type) {
    case AISearchActionTypes.SET_LOADING:
      return { ...state, loading: action.payload, error: null };

    case AISearchActionTypes.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
        loading: false,
      };

    case AISearchActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case AISearchActionTypes.CLEAR_CHAT:
      return { ...state, messages: [], error: null };

    case AISearchActionTypes.LOAD_FROM_STORAGE:
      return { ...state, messages: action.payload || [] };

    default:
      return state;
  }
}
