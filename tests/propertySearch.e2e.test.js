/**
 * End-to-End Integration Test (REFACTOR)
 * Tests complete search workflow with real Connecticut data:
 * Load CSV → Filter → Sort → Paginate
 */

const path = require('path');
const { loadCsvFile } = require('../src/property-search/csvLoader');
const { searchByCity } = require('../src/property-search/searchService');
const { filterByPriceRange } = require('../src/property-search/priceFilter');
const { filterByPropertyType, filterByResidentialType } = require('../src/property-search/typeFilter');
const { sortProperties } = require('../src/property-search/propertySorter');
const { paginate } = require('../src/property-search/paginator');

describe('End-to-End Property Search', () => {
  let allProperties;

  beforeAll(async () => {
    const csvPath = path.join(__dirname, '../data/ct-sample-50.csv');
    const result = await loadCsvFile(csvPath);
    expect(result.isSuccess).toBe(true);
    allProperties = result.value;
  });

  it('should load real Connecticut data from CSV', () => {
    expect(allProperties).toBeDefined();
    expect(allProperties.length).toBeGreaterThan(40);
    expect(allProperties[0].state).toBe('CT');
    expect(allProperties[0].metadata.propertyType).toBeDefined();
  });

  it('should find all residential properties in Ansonia', () => {
    const ansoniaProps = searchByCity(allProperties, 'Ansonia');
    const residential = filterByPropertyType(ansoniaProps, 'Residential');

    expect(ansoniaProps.length).toBeGreaterThan(0);
    expect(residential.every((p) => p.city === 'Ansonia')).toBe(true);
    expect(residential.every((p) => p.metadata.propertyType === 'Residential')).toBe(true);
  });

  it('should filter by price range and sort by price ascending', () => {
    const affordable = filterByPriceRange(allProperties, 100000, 250000);
    const sorted = sortProperties(affordable, 'price', 'asc');

    expect(sorted.length).toBeGreaterThan(0);
    expect(sorted.every((p) => p.price >= 100000 && p.price <= 250000)).toBe(true);
    
    // Verify sorted
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].price).toBeGreaterThanOrEqual(sorted[i - 1].price);
    }
  });

  it('should find luxury single-family homes and paginate results', () => {
    const luxury = filterByPriceRange(allProperties, 300000, 1000000);
    const singleFamily = filterByResidentialType(luxury, 'Single Family');
    const byPrice = sortProperties(singleFamily, 'price', 'desc');
    const page1 = paginate(byPrice, { page: 1, pageSize: 5 });

    expect(page1.data.length).toBeGreaterThan(0);
    expect(page1.data.length).toBeLessThanOrEqual(5);
    expect(page1.totalItems).toBe(singleFamily.length);
    expect(page1.data.every((p) => p.metadata.residentialType === 'Single Family')).toBe(true);
    expect(page1.data.every((p) => p.price >= 300000)).toBe(true);
    
    // Verify descending price order
    for (let i = 1; i < page1.data.length; i++) {
      expect(page1.data[i].price).toBeLessThanOrEqual(page1.data[i - 1].price);
    }
  });

  it('should handle complex multi-filter query', () => {
    const results = allProperties
      .filter((p) => p.metadata.propertyType === 'Residential')
      .filter((p) => p.price >= 200000 && p.price <= 400000)
      .filter((p) => ['Avon', 'Berlin', 'Bethel'].includes(p.city));
    
    const sorted = sortProperties(results, 'saleDate', 'desc');
    const page = paginate(sorted, { page: 1, pageSize: 10 });

    expect(page.data.length).toBeGreaterThan(0);
    expect(page.data.every((p) => p.metadata.propertyType === 'Residential')).toBe(true);
    expect(page.data.every((p) => p.price >= 200000 && p.price <= 400000)).toBe(true);
    expect(page.hasNextPage).toBeDefined();
    expect(page.totalPages).toBeGreaterThanOrEqual(1);
  });

  it('should demonstrate full API: filter → sort → paginate', () => {
    // Step 1: Filter - Residential condos under $400k
    let results = filterByPropertyType(allProperties, 'Residential');
    results = filterByResidentialType(results, 'Condo');
    results = filterByPriceRange(results, 0, 400000);

    // Step 2: Sort by price ascending
    results = sortProperties(results, 'price', 'asc');

    // Step 3: Paginate (page 1, 5 per page)
    const page1 = paginate(results, { page: 1, pageSize: 5 });

    // Verify pipeline worked
    expect(page1.data.every((p) => p.metadata.residentialType === 'Condo')).toBe(true);
    expect(page1.data.every((p) => p.price <= 400000)).toBe(true);
    
    // Verify sorting
    if (page1.data.length > 1) {
      for (let i = 1; i < page1.data.length; i++) {
        expect(page1.data[i].price).toBeGreaterThanOrEqual(page1.data[i - 1].price);
      }
    }

    // Verify pagination metadata
    expect(page1.page).toBe(1);
    expect(page1.pageSize).toBe(5);
    expect(page1.totalItems).toBe(results.length);
  });

  it('should handle empty result sets gracefully', () => {
    // Search for impossible criteria
    const results = filterByPriceRange(allProperties, 1000000, 2000000);
    const page = paginate(results, { page: 1, pageSize: 10 });

    expect(page.data.length).toBe(0);
    expect(page.totalItems).toBe(0);
    expect(page.totalPages).toBe(0);
    expect(page.hasNextPage).toBe(false);
  });

  it('should demonstrate commercial property search', () => {
    const commercial = filterByPropertyType(allProperties, 'Commercial');
    const sorted = sortProperties(commercial, 'price', 'desc');

    if (sorted.length > 0) {
      expect(sorted.every((p) => p.metadata.propertyType === 'Commercial')).toBe(true);
      expect(sorted[0].metadata.residentialType).toBe('');
    }
  });
});
