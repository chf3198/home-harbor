/**
 * @fileoverview Filter extraction and normalization utilities
 * @semantic filters, validation, normalization
 */

import { SearchFilters, CT_CITIES, VALID_PROPERTY_TYPES, VALID_RESIDENTIAL_TYPES } from './chat-types';

/**
 * Extract JSON from LLM response (handles markdown code blocks)
 */
export function extractJSON(text: string): any | null {
  // Try direct parse first
  try {
    return JSON.parse(text.trim());
  } catch {}

  // Try extracting from code block
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }

  // Try finding JSON object in text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {}
  }

  return null;
}

/**
 * Validate and normalize extracted filters
 */
export function normalizeFilters(raw: any): SearchFilters {
  const filters: SearchFilters = {
    city: null, minPrice: null, maxPrice: null,
    bedrooms: null, bathrooms: null,
    propertyType: null, residentialType: null,
  };

  if (!raw || typeof raw !== 'object') return filters;

  // Validate city
  if (raw.city && typeof raw.city === 'string') {
    const match = CT_CITIES.find(c => c.toLowerCase() === raw.city.toLowerCase());
    if (match) filters.city = match;
  }

  // Validate numeric fields
  if (raw.minPrice && !isNaN(Number(raw.minPrice))) filters.minPrice = Number(raw.minPrice);
  if (raw.maxPrice && !isNaN(Number(raw.maxPrice))) filters.maxPrice = Number(raw.maxPrice);
  if (raw.bedrooms && !isNaN(Number(raw.bedrooms))) filters.bedrooms = Number(raw.bedrooms);
  if (raw.bathrooms && !isNaN(Number(raw.bathrooms))) filters.bathrooms = Number(raw.bathrooms);

  // Validate enums
  if (raw.propertyType && VALID_PROPERTY_TYPES.includes(raw.propertyType)) {
    filters.propertyType = raw.propertyType;
  }
  if (raw.residentialType && VALID_RESIDENTIAL_TYPES.includes(raw.residentialType)) {
    filters.residentialType = raw.residentialType;
  }

  return filters;
}

/**
 * Check if filters have any non-null values
 */
export function hasFilters(filters: SearchFilters): boolean {
  return Object.values(filters).some(v => v !== null);
}

/**
 * Format filters for display in prompt
 */
export function formatFiltersForPrompt(filters: SearchFilters): string {
  const parts: string[] = [];
  if (filters.city) parts.push(`city: ${filters.city}`);
  if (filters.minPrice) parts.push(`min: $${filters.minPrice.toLocaleString()}`);
  if (filters.maxPrice) parts.push(`max: $${filters.maxPrice.toLocaleString()}`);
  if (filters.bedrooms) parts.push(`${filters.bedrooms}+ beds`);
  if (filters.residentialType) parts.push(`type: ${filters.residentialType}`);
  return parts.length > 0 ? parts.join(', ') : 'none';
}
