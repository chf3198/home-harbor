/**
 * @fileoverview Property detail fetching utilities
 */

import { getApiBase } from './configUtils.js';

const ENRICH_API_URL = 'https://n5hclfza8a.execute-api.us-east-1.amazonaws.com/prod/enrich';

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

/**
 * Enrich property with CAMA data (beds, baths, sqft, etc.)
 * @param {string} address - Property address
 * @param {string} town - Town name
 * @returns {Promise<{ok: boolean, data?: object, error?: string}>}
 */
export async function enrichProperty(address, town) {
  try {
    const params = new URLSearchParams({ address, town });
    const response = await fetch(`${ENRICH_API_URL}?${params}`);
    
    if (!response.ok) {
      return { ok: false, error: 'Failed to enrich property' };
    }
    
    const data = await response.json();
    
    if (!data.success) {
      return { ok: false, error: data.error || 'Enrichment failed' };
    }
    
    return { ok: true, data: data.enrichment };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}