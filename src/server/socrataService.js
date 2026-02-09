/**
 * @fileoverview Socrata CT Open Data Portal Service
 * @description Query CT real estate sales data dynamically via Socrata API
 * @see https://data.ct.gov/resource/5mzw-sjtu.json
 */

const SOCRATA_BASE_URL = 'https://data.ct.gov/resource/5mzw-sjtu.json';

/** Cached metadata to avoid repeated API calls */
let cachedMetadata = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour cache

/**
 * Build SoQL query parameters from search filters
 * @param {Object} filters - Search filters
 * @returns {URLSearchParams}
 */
function buildSoQLQuery(filters) {
  const params = new URLSearchParams();
  const whereClauses = [];

  // Filter by city (town field)
  if (filters.city) {
    whereClauses.push(`upper(town) = upper('${filters.city.replace(/'/g, "''")}')`);
  }

  // Filter by price range
  if (filters.minPrice) {
    whereClauses.push(`saleamount >= ${filters.minPrice}`);
  }
  if (filters.maxPrice) {
    whereClauses.push(`saleamount <= ${filters.maxPrice}`);
  }

  // Filter by property type
  if (filters.propertyType) {
    whereClauses.push(`upper(propertytype) = upper('${filters.propertyType.replace(/'/g, "''")}')`);
  }

  // Filter by residential type
  if (filters.residentialType) {
    whereClauses.push(`upper(residentialtype) = upper('${filters.residentialType.replace(/'/g, "''")}')`);
  }

  // Only include recent sales (2020+) for relevance
  whereClauses.push(`listyear >= '2020'`);

  // Combine WHERE clauses
  if (whereClauses.length > 0) {
    params.set('$where', whereClauses.join(' AND '));
  }

  // Order by date (most recent first)
  params.set('$order', 'daterecorded DESC, saleamount DESC');

  // Pagination
  params.set('$limit', String(filters.limit || 50));
  params.set('$offset', String(filters.offset || 0));

  return params;
}

/**
 * Transform Socrata property to our app format
 */
function transformProperty(raw) {
  const location = raw.geo_coordinates?.coordinates
    ? { lat: raw.geo_coordinates.coordinates[1], lng: raw.geo_coordinates.coordinates[0] }
    : null;

  return {
    id: raw.serialnumber,
    address: raw.address || 'Unknown Address',
    city: raw.town || 'Unknown',
    state: 'CT',
    price: Number(raw.saleamount) || 0,
    assessedValue: Number(raw.assessedvalue) || 0,
    salesRatio: Number(raw.salesratio) || 0,
    listYear: Number(raw.listyear) || 0,
    dateRecorded: raw.daterecorded || '',
    location,
    metadata: {
      propertyType: raw.propertytype || 'Unknown',
      residentialType: raw.residentialtype,
      remarks: raw.remarks,
    },
  };
}

/**
 * Query CT Open Data Portal for properties matching filters
 */
async function queryPropertiesFromSocrata(filters = {}) {
  const queryParams = buildSoQLQuery(filters);
  const url = `${SOCRATA_BASE_URL}?${queryParams.toString()}`;

  console.log('[Socrata] Query URL:', url);

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Socrata API error: ${response.status} ${response.statusText}`);
  }

  const rawProperties = await response.json();
  const properties = rawProperties.map(transformProperty);

  // Get total count
  const countParams = new URLSearchParams();
  const whereClauses = queryParams.get('$where');
  if (whereClauses) {
    countParams.set('$where', whereClauses);
  }
  countParams.set('$select', 'count(*)');

  const countResponse = await fetch(`${SOCRATA_BASE_URL}?${countParams.toString()}`);
  const countData = await countResponse.json();
  const totalCount = countData[0]?.count ? parseInt(countData[0].count) : properties.length;

  return { properties, count: totalCount };
}

/**
 * Get dataset metadata - cities, price ranges, property types
 */
async function getDatasetMetadata() {
  const now = Date.now();
  if (cachedMetadata && now - cacheTimestamp < CACHE_TTL_MS) {
    console.log('[Socrata] Using cached metadata');
    return cachedMetadata;
  }

  console.log('[Socrata] Fetching dataset metadata...');

  const [cities, priceStats, propertyTypes, residentialTypes, countData] = await Promise.all([
    fetchDistinctValues('town', 200),
    fetchPriceRange(),
    fetchDistinctValues('propertytype', 50),
    fetchDistinctValues('residentialtype', 50),
    fetchRecordCount(),
  ]);

  cachedMetadata = {
    cities: cities.sort(),
    priceRange: priceStats,
    propertyTypes: propertyTypes.filter(Boolean),
    residentialTypes: residentialTypes.filter(Boolean),
    totalRecords: countData.count,
    lastUpdated: countData.lastDate || new Date().toISOString(),
  };
  cacheTimestamp = now;

  console.log('[Socrata] Metadata cached:', {
    cities: cachedMetadata.cities.length,
    priceRange: cachedMetadata.priceRange,
    propertyTypes: cachedMetadata.propertyTypes.length,
  });

  return cachedMetadata;
}

/** Fetch distinct values for a column */
async function fetchDistinctValues(column, limit) {
  const params = new URLSearchParams({
    '$select': `distinct ${column}`,
    '$order': column,
    '$where': "listyear >= '2020'",
    '$limit': String(limit),
  });

  const response = await fetch(`${SOCRATA_BASE_URL}?${params.toString()}`);
  if (!response.ok) return [];

  const data = await response.json();
  return data.map((row) => row[column]).filter(Boolean);
}

/** Fetch min/max price range */
async function fetchPriceRange() {
  const params = new URLSearchParams({
    '$select': 'min(saleamount) as min_price, max(saleamount) as max_price',
    '$where': "listyear >= '2020' AND saleamount > 10000",
  });

  const response = await fetch(`${SOCRATA_BASE_URL}?${params.toString()}`);
  if (!response.ok) return { min: 50000, max: 5000000 };

  const data = await response.json();
  return {
    min: Number(data[0]?.min_price) || 50000,
    max: Number(data[0]?.max_price) || 5000000,
  };
}

/** Fetch total record count and most recent date */
async function fetchRecordCount() {
  const params = new URLSearchParams({
    '$select': 'count(*) as total, max(daterecorded) as last_date',
    '$where': "listyear >= '2020'",
  });

  const response = await fetch(`${SOCRATA_BASE_URL}?${params.toString()}`);
  if (!response.ok) return { count: 0, lastDate: '' };

  const data = await response.json();
  return {
    count: Number(data[0]?.total) || 0,
    lastDate: data[0]?.last_date || '',
  };
}

module.exports = {
  queryPropertiesFromSocrata,
  getDatasetMetadata,
  SOCRATA_BASE_URL,
};
