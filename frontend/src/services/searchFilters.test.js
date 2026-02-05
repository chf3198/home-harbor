/**
 * @fileoverview Tests for search filter utilities
 * @description Unit tests for Orama filter building
 */

import { describe, it, expect } from 'vitest';
import {
  buildFilterConditions,
  formatSearchResults,
  buildRAGContext,
} from '../services/searchFilters.js';

describe('searchFilters', () => {
  describe('buildFilterConditions', () => {
    it('returns empty object for empty filters', () => {
      expect(buildFilterConditions({})).toEqual({});
    });

    it('builds price range filter', () => {
      const result = buildFilterConditions({ minPrice: 100000, maxPrice: 500000 });
      expect(result.price).toEqual({ gte: 100000, lte: 500000 });
    });

    it('builds bedroom filter', () => {
      const result = buildFilterConditions({ minBedrooms: 2, maxBedrooms: 4 });
      expect(result.bedrooms).toEqual({ gte: 2, lte: 4 });
    });

    it('builds city filter', () => {
      const result = buildFilterConditions({ city: 'Hartford' });
      expect(result.city).toBe('Hartford');
    });

    it('combines multiple filters', () => {
      const result = buildFilterConditions({
        minPrice: 200000,
        city: 'Bristol',
        propertyType: 'Single Family',
      });
      expect(result.price).toEqual({ gte: 200000 });
      expect(result.city).toBe('Bristol');
      expect(result.propertyType).toBe('Single Family');
    });
  });

  describe('formatSearchResults', () => {
    it('formats results with relevance score', () => {
      const results = [{ id: '1', address: '123 Main', score: 0.95 }];
      const formatted = formatSearchResults(results);
      expect(formatted[0].relevanceScore).toBe(0.95);
    });
  });

  describe('buildRAGContext', () => {
    it('returns message for empty results', () => {
      expect(buildRAGContext([])).toBe('No relevant properties found.');
    });

    it('builds context string from properties', () => {
      const results = [
        { address: '123 Main St', city: 'Hartford', state: 'CT', price: 250000 },
      ];
      const context = buildRAGContext(results);
      expect(context).toContain('123 Main St');
      expect(context).toContain('Hartford');
      expect(context).toContain('$250,000');
    });
  });
});
