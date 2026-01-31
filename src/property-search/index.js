/**
 * Property Search Module
 * 
 * Public API for property search functionality
 */

const { Property, Result } = require('./Property');
const { searchByCity } = require('./searchService');
const { filterByPriceRange } = require('./priceFilter');

module.exports = {
  Property,
  Result,
  searchByCity,
  filterByPriceRange
};
