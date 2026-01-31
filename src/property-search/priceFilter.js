/**
 * Price filtering functions
 */

/**
 * Filter properties by price range (inclusive)
 * @param {Array<Property>} properties - Properties to filter
 * @param {number} minPrice - Minimum price (inclusive)
 * @param {number} maxPrice - Maximum price (inclusive)
 * @returns {Array<Property>} Filtered properties
 */
function filterByPriceRange(properties, minPrice, maxPrice) {
  if (minPrice < 0) {
    throw new Error('Minimum price must be non-negative');
  }

  if (maxPrice < minPrice) {
    throw new Error('Maximum price must be greater than minimum');
  }

  return properties.filter(prop =>
    prop.price >= minPrice && prop.price <= maxPrice
  );
}

module.exports = { filterByPriceRange };
