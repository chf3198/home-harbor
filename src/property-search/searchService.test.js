/**
 * Property Search Service Tests
 * 
 * Tests for searching and filtering property listings
 */

const { searchByCity } = require('./searchService');
const { Property } = require('./Property');

describe('Property Search Service', () => {
  let testProperties;

  beforeEach(() => {
    // Create test properties - use .value (neverthrow API)
    testProperties = [
      Property.create({
        address: '123 Main St',
        city: 'Columbus',
        state: 'OH',
        zipCode: '43215',
        price: 250000,
        bedrooms: 3,
        bathrooms: 2
      }).value,
      Property.create({
        address: '456 Oak Ave',
        city: 'Cleveland',
        state: 'OH',
        zipCode: '44101',
        price: 180000,
        bedrooms: 2,
        bathrooms: 1
      }).value,
      Property.create({
        address: '789 Elm Dr',
        city: 'Columbus',
        state: 'OH',
        zipCode: '43220',
        price: 320000,
        bedrooms: 4,
        bathrooms: 3
      }).value
    ];
  });

  describe('searchByCity', () => {
    test('returns properties matching city (case-insensitive)', () => {
      const results = searchByCity(testProperties, 'columbus');

      expect(results).toHaveLength(2);
      expect(results[0].city).toBe('Columbus');
      expect(results[1].city).toBe('Columbus');
    });

    test('returns empty array when no matches', () => {
      const results = searchByCity(testProperties, 'Cincinnati');

      expect(results).toEqual([]);
    });

    test('throws error for empty city parameter', () => {
      expect(() => searchByCity(testProperties, '')).toThrow('City cannot be empty');
    });

    test('throws error for null city parameter', () => {
      expect(() => searchByCity(testProperties, null)).toThrow('City cannot be empty');
    });
  });
});
