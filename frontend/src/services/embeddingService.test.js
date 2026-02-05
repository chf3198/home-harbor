/**
 * @fileoverview Tests for embedding service utilities
 * @description Unit tests for property text conversion
 */

import { describe, it, expect } from 'vitest';
import { propertyToSearchText } from '../services/embeddingService.js';

describe('embeddingService', () => {
  describe('propertyToSearchText', () => {
    it('combines property fields into searchable text', () => {
      const property = {
        address: '123 Main St',
        city: 'Hartford',
        state: 'CT',
        bedrooms: 3,
        bathrooms: 2,
        price: 250000,
      };
      const text = propertyToSearchText(property);

      expect(text).toContain('123 Main St');
      expect(text).toContain('Hartford');
      expect(text).toContain('CT');
      expect(text).toContain('3 bedrooms');
      expect(text).toContain('2 bathrooms');
      expect(text).toContain('$250,000');
    });

    it('handles missing fields gracefully', () => {
      const property = { address: '123 Main St' };
      const text = propertyToSearchText(property);

      expect(text).toContain('123 Main St');
      expect(text).toContain('0 bedrooms'); // Default
    });

    it('includes property type from metadata', () => {
      const property = {
        address: '456 Oak',
        metadata: { propertyType: 'Condo' },
      };
      const text = propertyToSearchText(property);

      expect(text).toContain('Condo');
    });

    it('includes description', () => {
      const property = {
        address: '789 Pine',
        description: 'Beautiful waterfront property',
      };
      const text = propertyToSearchText(property);

      expect(text).toContain('Beautiful waterfront property');
    });
  });
});
