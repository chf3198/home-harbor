/**
 * Property Sorting Tests (RED)
 * Sorts properties by price, sale date, assessed value, etc.
 */

const { sortProperties } = require('./propertySorter');

describe('propertySorter', () => {
  const sampleProperties = [
    {
      address: '123 Main St',
      city: 'Ansonia',
      price: 248400,
      metadata: { assessedValue: 133000, saleDate: '04/14/2021', listYear: 2020 },
    },
    {
      address: '456 Oak Ave',
      city: 'Avon',
      price: 362500,
      metadata: { assessedValue: 179990, saleDate: '06/20/2022', listYear: 2021 },
    },
    {
      address: '789 Elm St',
      city: 'Berlin',
      price: 190790,
      metadata: { assessedValue: 140600, saleDate: '08/10/2021', listYear: 2020 },
    },
  ];

  describe('sort by price', () => {
    it('should sort by price ascending', () => {
      const result = sortProperties(sampleProperties, 'price', 'asc');

      expect(result[0].price).toBe(190790);
      expect(result[1].price).toBe(248400);
      expect(result[2].price).toBe(362500);
    });

    it('should sort by price descending', () => {
      const result = sortProperties(sampleProperties, 'price', 'desc');

      expect(result[0].price).toBe(362500);
      expect(result[1].price).toBe(248400);
      expect(result[2].price).toBe(190790);
    });
  });

  describe('sort by assessedValue', () => {
    it('should sort by assessed value ascending', () => {
      const result = sortProperties(sampleProperties, 'assessedValue', 'asc');

      expect(result[0].metadata.assessedValue).toBe(133000);
      expect(result[1].metadata.assessedValue).toBe(140600);
      expect(result[2].metadata.assessedValue).toBe(179990);
    });

    it('should sort by assessed value descending', () => {
      const result = sortProperties(sampleProperties, 'assessedValue', 'desc');

      expect(result[0].metadata.assessedValue).toBe(179990);
      expect(result[2].metadata.assessedValue).toBe(133000);
    });
  });

  describe('sort by saleDate', () => {
    it('should sort by sale date ascending (oldest first)', () => {
      const result = sortProperties(sampleProperties, 'saleDate', 'asc');

      expect(result[0].metadata.saleDate).toBe('04/14/2021');
      expect(result[1].metadata.saleDate).toBe('08/10/2021');
      expect(result[2].metadata.saleDate).toBe('06/20/2022');
    });

    it('should sort by sale date descending (newest first)', () => {
      const result = sortProperties(sampleProperties, 'saleDate', 'desc');

      expect(result[0].metadata.saleDate).toBe('06/20/2022');
      expect(result[2].metadata.saleDate).toBe('04/14/2021');
    });
  });

  describe('sort by city', () => {
    it('should sort by city alphabetically', () => {
      const result = sortProperties(sampleProperties, 'city', 'asc');

      expect(result[0].city).toBe('Ansonia');
      expect(result[1].city).toBe('Avon');
      expect(result[2].city).toBe('Berlin');
    });
  });

  describe('edge cases', () => {
    it('should default to ascending when order not specified', () => {
      const result = sortProperties(sampleProperties, 'price');

      expect(result[0].price).toBeLessThan(result[1].price);
    });

    it('should return original array when sortBy is invalid', () => {
      const result = sortProperties(sampleProperties, 'nonexistent', 'asc');

      expect(result).toEqual(sampleProperties);
    });

    it('should not mutate original array', () => {
      const original = [...sampleProperties];
      sortProperties(sampleProperties, 'price', 'desc');

      expect(sampleProperties).toEqual(original);
    });

    it('should throw on null properties', () => {
      expect(() => sortProperties(null, 'price', 'asc')).toThrow();
    });
  });
});
