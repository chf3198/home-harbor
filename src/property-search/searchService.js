/**
 * Property Search Service
 * 
 * Pure functions for searching and filtering properties
 */

/**
 * Search properties by city name
 * @param {Array<Property>} properties - Array of property objects
 * @param {string} city - City name to search (case-insensitive)
 * @returns {Array<Property>} Filtered properties matching city
 * @throws {Error} If city is empty or null
 */
function searchByCity(properties, city) {
  if (!city || city.trim() === '') {
    throw new Error('City cannot be empty');
  }

  const cityLower = city.toLowerCase();
  return properties.filter(prop => 
    prop.city.toLowerCase() === cityLower
  );
}

module.exports = {
  searchByCity
};
