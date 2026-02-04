/**
 * @fileoverview Property detail fetching utilities
 */

import { getApiBase } from './configUtils.js';

export async function fetchPropertyDetail(propertyId) {
  try {
    const response = await fetch(`${getApiBase()}/api/properties/${propertyId}`);
    if (!response.ok) {
      return { ok: false, error: 'Failed to load property details' };
    }
    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}