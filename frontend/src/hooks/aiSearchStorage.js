/**
 * @fileoverview localStorage utilities for AI chat persistence
 * @semantic storage, persistence, ai
 */

const CHAT_KEY = 'homeharbor_chat_history';
const FILTERS_KEY = 'homeharbor_filters';
const RESULTS_KEY = 'homeharbor_results';

/**
 * Save chat messages to localStorage
 */
export function saveChatHistory(messages) {
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
  } catch (e) {
    console.warn('Failed to save chat history:', e);
  }
}

/**
 * Load chat messages from localStorage
 */
export function loadChatHistory() {
  try {
    const stored = localStorage.getItem(CHAT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn('Failed to load chat history:', e);
    return [];
  }
}

/**
 * Save search filters to localStorage
 */
export function saveFilters(filters) {
  try {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  } catch (e) {
    console.warn('Failed to save filters:', e);
  }
}

/**
 * Load search filters from localStorage
 */
export function loadFilters() {
  try {
    const stored = localStorage.getItem(FILTERS_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.warn('Failed to load filters:', e);
    return null;
  }
}

/**
 * Save search results to localStorage
 */
export function saveResults(results) {
  try {
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  } catch (e) {
    console.warn('Failed to save results:', e);
  }
}

/**
 * Load search results from localStorage
 */
export function loadResults() {
  try {
    const stored = localStorage.getItem(RESULTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn('Failed to load results:', e);
    return [];
  }
}

/**
 * Clear all persisted state
 */
export function clearAllStorage() {
  try {
    localStorage.removeItem(CHAT_KEY);
    localStorage.removeItem(FILTERS_KEY);
    localStorage.removeItem(RESULTS_KEY);
  } catch (e) {
    console.warn('Failed to clear storage:', e);
  }
}
