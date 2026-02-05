/**
 * @fileoverview Search filter utilities for Orama
 * @description Builds filter conditions for property searches
 * @semantic filters, search, orama
 */

/**
 * Build Orama filter conditions from property filters
 * @param {Object} filters - Property filters
 * @param {number} [filters.minPrice] - Minimum price
 * @param {number} [filters.maxPrice] - Maximum price
 * @param {number} [filters.minBedrooms] - Minimum bedrooms
 * @param {number} [filters.maxBedrooms] - Maximum bedrooms
 * @param {string} [filters.city] - City filter
 * @param {string} [filters.propertyType] - Property type filter
 * @returns {Object} Orama where conditions
 */
export function buildFilterConditions(filters) {
  const where = {};

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }

  if (filters.minBedrooms !== undefined || filters.maxBedrooms !== undefined) {
    where.bedrooms = {};
    if (filters.minBedrooms !== undefined) where.bedrooms.gte = filters.minBedrooms;
    if (filters.maxBedrooms !== undefined) where.bedrooms.lte = filters.maxBedrooms;
  }

  if (filters.city) {
    where.city = filters.city;
  }

  if (filters.propertyType) {
    where.propertyType = filters.propertyType;
  }

  return where;
}

/**
 * Format property results for display
 * @param {Object[]} results - Raw search results
 * @returns {Object[]} Formatted results
 */
export function formatSearchResults(results) {
  return results.map((result) => ({
    id: result.id,
    address: result.address,
    city: result.city,
    state: result.state,
    price: result.price,
    bedrooms: result.bedrooms,
    bathrooms: result.bathrooms,
    propertyType: result.propertyType,
    description: result.description,
    relevanceScore: result.score,
  }));
}

/**
 * Build context string from search results for RAG
 * @param {Object[]} results - Search results
 * @returns {string} Formatted context for LLM
 */
export function buildRAGContext(results) {
  if (!results.length) return 'No relevant properties found.';

  return results
    .map((r, i) => {
      const lines = [
        `Property ${i + 1}: ${r.address}`,
        `  Location: ${r.city}, ${r.state}`,
        `  Price: $${r.price?.toLocaleString() || 'N/A'}`,
        `  Bedrooms: ${r.bedrooms || 'N/A'}, Bathrooms: ${r.bathrooms || 'N/A'}`,
        `  Type: ${r.propertyType || 'N/A'}`,
        r.description ? `  Description: ${r.description}` : '',
      ];
      return lines.filter(Boolean).join('\n');
    })
    .join('\n\n');
}
