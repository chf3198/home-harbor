/**
 * @fileoverview API interaction utilities
 */

import { getApiBase, isApiEnabled } from './configUtils.js';

// Fetch configuration
export async function fetchConfig() {
  try {
    const response = await fetch(`${getApiBase()}/api/config`);
    if (!response.ok) return;
    const config = await response.json();
    window.HOME_HARBOR_CONFIG = config;
  } catch (error) {
    // Ignore config errors
  }
}

// Fetch city suggestions
export async function fetchCitySuggestions() {
  if (!isApiEnabled()) return;
  try {
    const response = await fetch(`${getApiBase()}/api/properties/cities`);
    if (!response.ok) return;
    const cities = await response.json();
    window.HOME_HARBOR_CITIES = cities;
  } catch (error) {
    // Ignore city fetch errors
  }
}