/**
 * CT Real Estate Data Mapper
 * 
 * Maps Connecticut open data CSV schema to Property entities
 * Source: https://data.ct.gov/Housing-and-Development/Real-Estate-Sales-2001-2023-GL
 */

const { Property } = require('./Property');
const { err } = require('neverthrow');

/**
 * Parse currency string to number
 * @param {string} value - e.g. "248,400.00"
 * @returns {number|undefined}
 */
function parseCurrency(value) {
  if (!value || value.trim() === '') return undefined;
  const cleaned = value.replace(/[,$]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

/**
 * Map CT CSV row to Property entity
 * @param {Object} ctRow - Row from CT dataset
 * @returns {Result} Result containing Property or error
 */
function ctToProperty(ctRow) {
  const town = ctRow.Town?.trim();
  const address = ctRow.Address?.trim();
  const saleAmount = parseCurrency(ctRow['Sale Amount']);
  const assessedValue = parseCurrency(ctRow['Assessed Value']);

  // Validate required fields
  if (!address) {
    return err('Address is required');
  }

  if (!town) {
    return err('Town is required');
  }

  if (saleAmount === undefined || saleAmount <= 0) {
    return err('Sale Amount must be positive');
  }

  // Build property object
  const fullAddress = `${address}, ${town}`;
  
  return Property.create({
    address: fullAddress,
    city: town,
    state: 'CT',
    zipCode: undefined, // Not in CT dataset
    price: saleAmount,
    bedrooms: undefined, // Not in CT dataset
    bathrooms: undefined, // Not in CT dataset
    metadata: {
      propertyType: ctRow['Property Type']?.trim() || '',
      residentialType: ctRow['Residential Type']?.trim() || '',
      assessedValue,
      saleDate: ctRow['Date Recorded']?.trim(),
      listYear: parseInt(ctRow['List Year']),
      salesRatio: parseFloat(ctRow['Sales Ratio']),
      serialNumber: ctRow['Serial Number']?.trim(),
      location: ctRow.Location?.trim(),
    },
  });
}

module.exports = { ctToProperty };
