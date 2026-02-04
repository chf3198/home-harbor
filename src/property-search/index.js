/**
 * Property Search API
 * 
 * Public exports for property search functionality
 */

const { Property } = require('./Property');
const { searchByCity } = require('./searchService');
const { filterByPriceRange } = require('./priceFilter');
const { filterByPropertyType, filterByResidentialType } = require('./typeFilter');
const { sortProperties } = require('./propertySorter');
const { paginate } = require('./paginator');
const { loadCsvFile } = require('./csvLoader');
const { ctToProperty } = require('./ctDataMapper');

module.exports = {
  // Core entities
  Property,
  
  // Search & Filter
  searchByCity,
  filterByPriceRange,
  filterByPropertyType,
  filterByResidentialType,
  
  // Sorting & Pagination
  sortProperties,
  paginate,
  
  // Data Loading
  loadCsvFile,
  ctToProperty,
};
