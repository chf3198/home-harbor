/**
 * @fileoverview Application initialization
 */

import { elements } from './dom.js';
import { fetchConfig, fetchCitySuggestions } from './api.js';
import { handleSearch, handleChat, fetchResults } from './handlers.js';
import { openHelp, closeHelp } from './help.js';
import { setStatus, setLoading } from './ui.js';

// Set up event listeners
export function setupEventListeners() {
  const { form, chatForm, helpButton, helpClose, helpTabUser, helpTabDev } = elements;

  if (form) {
    form.addEventListener('submit', handleSearch);
  }

  if (chatForm) {
    chatForm.addEventListener('submit', handleChat);
  }

  if (helpButton) {
    helpButton.addEventListener('click', () => openHelp('user'));
  }

  if (helpClose) {
    helpClose.addEventListener('click', closeHelp);
  }

  if (helpTabUser) {
    helpTabUser.addEventListener('click', () => openHelp('user'));
  }

  if (helpTabDev) {
    helpTabDev.addEventListener('click', () => openHelp('developer'));
  }
}

// Initialize the application
export async function init() {
  setupEventListeners();

  fetchConfig();
  fetchCitySuggestions();
  // Note: Don't auto-fetch results on init - let user submit search form
  // This avoids conflicts with inline script in single-file mode
}