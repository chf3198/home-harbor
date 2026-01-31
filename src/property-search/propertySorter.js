/**
 * Property Sorter
 * 
 * Pure functions for sorting properties by various criteria
 */

/**
 * Parse MM/DD/YYYY date string to comparable number
 * @param {string} dateStr - e.g. "04/14/2021"
 * @returns {number} Timestamp for comparison
 */
function parseDate(dateStr) {
  if (!dateStr) return 0;
  const [month, day, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day).getTime();
}

/**
 * Sort properties by specified field and order
 * @param {Array<Property>} properties - Array of properties
 * @param {string} sortBy - Field to sort by: 'price', 'assessedValue', 'saleDate', 'city'
 * @param {string} order - 'asc' or 'desc' (default: 'asc')
 * @returns {Array<Property>} Sorted properties (new array)
 */
function sortProperties(properties, sortBy, order = 'asc') {
  if (!properties) {
    throw new Error('Properties array is required');
  }

  if (!sortBy) {
    return properties;
  }

  // Create copy to avoid mutation
  const sorted = [...properties];

  sorted.sort((a, b) => {
    let aVal, bVal;

    switch (sortBy) {
      case 'price':
        aVal = a.price;
        bVal = b.price;
        break;
      case 'assessedValue':
        aVal = a.metadata?.assessedValue || 0;
        bVal = b.metadata?.assessedValue || 0;
        break;
      case 'saleDate':
        aVal = parseDate(a.metadata?.saleDate);
        bVal = parseDate(b.metadata?.saleDate);
        break;
      case 'city':
        aVal = a.city?.toLowerCase() || '';
        bVal = b.city?.toLowerCase() || '';
        break;
      default:
        return 0; // Unknown field, no sort
    }

    // Compare values
    if (aVal < bVal) return order === 'desc' ? 1 : -1;
    if (aVal > bVal) return order === 'desc' ? -1 : 1;
    return 0;
  });

  return sorted;
}

module.exports = { sortProperties };
