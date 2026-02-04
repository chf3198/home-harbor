/**
 * Price Filter Tests
 */

const { filterByPriceRange } = require('./priceFilter');
const { Property } = require('./Property');

describe('filterByPriceRange', () => {
  let testProperties;

  beforeEach(() => {
    // Use .value (neverthrow API)
    testProperties = [
      Property.create({ address: '1', city: 'Columbus', price: 150000, bedrooms: 2, bathrooms: 1 }).value,
      Property.create({ address: '2', city: 'Columbus', price: 250000, bedrooms: 3, bathrooms: 2 }).value,
      Property.create({ address: '3', city: 'Columbus', price: 350000, bedrooms: 4, bathrooms: 3 }).value,
      Property.create({ address: '4', city: 'Columbus', price: 450000, bedrooms: 5, bathrooms: 4 }).value
    ];
  });

  test('filters properties within price range', () => {
    const results = filterByPriceRange(testProperties, 200000, 400000);

    expect(results).toHaveLength(2);
    expect(results[0].price).toBe(250000);
    expect(results[1].price).toBe(350000);
  });

  test('includes properties at exact min price', () => {
    const results = filterByPriceRange(testProperties, 250000, 400000);

    expect(results.some(p => p.price === 250000)).toBe(true);
  });

  test('includes properties at exact max price', () => {
    const results = filterByPriceRange(testProperties, 200000, 350000);

    expect(results.some(p => p.price === 350000)).toBe(true);
  });

  test('returns empty array when no matches', () => {
    const results = filterByPriceRange(testProperties, 500000, 600000);

    expect(results).toEqual([]);
  });

  test('throws error when min price negative', () => {
    expect(() => filterByPriceRange(testProperties, -100, 300000))
      .toThrow('Minimum price must be non-negative');
  });

  test('throws error when max less than min', () => {
    expect(() => filterByPriceRange(testProperties, 300000, 200000))
      .toThrow('Maximum price must be greater than minimum');
  });
});
