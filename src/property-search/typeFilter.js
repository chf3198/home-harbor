/**
 * Property Type Filters
 * 
 * Pure functions for filtering properties by type classifications
 * from Connecticut real estate dataset
 */

/**
 * Filter properties by property type
 * @param {Array<Property>} properties - Array of properties
 * @param {string} propertyType - e.g. "Residential", "Commercial", "Industrial"
 * @returns {Array<Property>} Filtered properties
 */
function filterByPropertyType(properties, propertyType) {
  if (!properties) {
    throw new Error('Properties array is required');
  }

  if (!propertyType || propertyType.trim() === '') {
    return properties;
  }

  const normalized = propertyType.toLowerCase().trim();
  
  return properties.filter((property) => {
    const propType = property.metadata?.propertyType || '';
    return propType.toLowerCase().trim() === normalized;
  });
}

/**
 * Filter properties by residential subtype
 * @param {Array<Property>} properties - Array of properties
 * @param {string} residentialType - e.g. "Single Family", "Condo", "Two Family"
 * @returns {Array<Property>} Filtered properties
 */
function filterByResidentialType(properties, residentialType) {
  if (!properties) {
    throw new Error('Properties array is required');
  }

  if (!residentialType || residentialType.trim() === '') {
    return properties;
  }

  const normalized = residentialType.toLowerCase().trim();
  
  return properties.filter((property) => {
    const resType = property.metadata?.residentialType || '';
    return resType.toLowerCase().trim() === normalized;
  });
}

module.exports = { filterByPropertyType, filterByResidentialType };
