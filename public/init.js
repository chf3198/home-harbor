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
  fetchResults().catch((error) => {
    setStatus(`Failed to load properties: ${error.message}`, 'error');
    setLoading(false);
  });
}