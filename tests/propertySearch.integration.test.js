/**
 * Property Search Integration Tests
 * 
 * Tests combining multiple search features
 */

const { Property, searchByCity, filterByPriceRange } = require('../src/property-search');

describe('Property Search Integration', () => {
  let properties;

  beforeEach(() => {
    // Create realistic test data
    properties = [
      Property.create({ address: '123 Main St', city: 'Columbus', state: 'OH', price: 180000, bedrooms: 2, bathrooms: 1 }).getValue(),
      Property.create({ address: '456 Oak Ave', city: 'Columbus', state: 'OH', price: 250000, bedrooms: 3, bathrooms: 2 }).getValue(),
      Property.create({ address: '789 Elm Dr', city: 'Columbus', state: 'OH', price: 320000, bedrooms: 4, bathrooms: 3 }).getValue(),
      Property.create({ address: '321 Maple Ln', city: 'Cleveland', state: 'OH', price: 200000, bedrooms: 3, bathrooms: 2 }).getValue(),
      Property.create({ address: '654 Pine Rd', city: 'Cleveland', state: 'OH', price: 280000, bedrooms: 3, bathrooms: 2 }).getValue()
    ];
  });

  test('combines city search and price filter', () => {
    // Search Columbus properties under $300k
    const columbusProps = searchByCity(properties, 'Columbus');
    const affordable = filterByPriceRange(columbusProps, 0, 300000);

    expect(affordable).toHaveLength(2);
    expect(affordable.every(p => p.city === 'Columbus')).toBe(true);
    expect(affordable.every(p => p.price <= 300000)).toBe(true);
  });

  test('filters then searches produces same result', () => {
    // Order shouldn't matter for independent filters
    const priceFiltered = filterByPriceRange(properties, 200000, 300000);
    const result1 = searchByCity(priceFiltered, 'Columbus');

    const cityFiltered = searchByCity(properties, 'Columbus');
    const result2 = filterByPriceRange(cityFiltered, 200000, 300000);

    expect(result1).toEqual(result2);
  });

  test('finds luxury properties in specific city', () => {
    const columbus = searchByCity(properties, 'Columbus');
    const luxury = filterByPriceRange(columbus, 300000, 1000000);

    expect(luxury).toHaveLength(1);
    expect(luxury[0].price).toBe(320000);
    expect(luxury[0].bedrooms).toBe(4);
  });
});
