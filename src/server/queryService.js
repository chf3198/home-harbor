const {
  searchByCity,
  filterByPriceRange,
  filterByPropertyType,
  filterByResidentialType,
  sortProperties,
} = require('../property-search');

function parseNumber(value, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function applyFilters(properties, query) {
  let filtered = properties;

  if (query.city) {
    filtered = searchByCity(filtered, query.city);
  }

  if (query.propertyType) {
    filtered = filterByPropertyType(filtered, query.propertyType);
  }

  if (query.residentialType) {
    filtered = filterByResidentialType(filtered, query.residentialType);
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const minPrice = parseNumber(query.minPrice, 0);
    const maxPrice = parseNumber(query.maxPrice, Number.MAX_SAFE_INTEGER);
    filtered = filterByPriceRange(filtered, minPrice, maxPrice);
  }

  if (query.sortBy) {
    const order = query.sortOrder === 'desc' ? 'desc' : 'asc';
    filtered = sortProperties(filtered, query.sortBy, order);
  }

  return filtered;
}

module.exports = {
  parseNumber,
  applyFilters,
};
