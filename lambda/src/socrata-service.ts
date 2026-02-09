/**
 * @fileoverview Socrata CT Open Data Portal Service
 * @description Query CT real estate sales data dynamically via Socrata API
 * @see https://data.ct.gov/resource/5mzw-sjtu.json
 */

const SOCRATA_BASE_URL = 'https://data.ct.gov/resource/5mzw-sjtu.json';

/** Property record from Socrata API */
export interface SocrataProperty {
  serialnumber: string;
  listyear: string;
  daterecorded: string;
  town: string;
  address: string;
  assessedvalue: string;
  saleamount: string;
  salesratio: string;
  propertytype?: string;
  residentialtype?: string;
  geo_coordinates?: {
    type: string;
    coordinates: [number, number];
  };
  remarks?: string;
}

/** Search filters matching our JSON filter format */
export interface SearchFilters {
  city?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  propertyType?: string | null;
  residentialType?: string | null;
  limit?: number;
  offset?: number;
}

/** Transformed property for our app */
export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  assessedValue: number;
  salesRatio: number;
  listYear: number;
  dateRecorded: string;
  location?: { lat: number; lng: number };
  metadata: {
    propertyType: string;
    residentialType?: string;
    remarks?: string;
  };
}

/**
 * Build SoQL query parameters from search filters
 * @see https://dev.socrata.com/docs/queries/
 */
function buildSoQLQuery(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  const whereClauses: string[] = [];

  // Filter by city (town field) - case-insensitive LIKE
  if (filters.city) {
    whereClauses.push(`upper(town) = upper('${filters.city.replace(/'/g, "''")}')`);
  }

  // Filter by price range (saleamount field)
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

  // Order by date (most recent first) then price
  params.set('$order', 'daterecorded DESC, saleamount DESC');

  // Pagination
  params.set('$limit', String(filters.limit || 50));
  params.set('$offset', String(filters.offset || 0));

  return params;
}

/**
 * Transform Socrata property to our app format
 */
function transformProperty(raw: SocrataProperty): Property {
  const location = raw.geo_coordinates?.coordinates
    ? { lat: raw.geo_coordinates.coordinates[1], lng: raw.geo_coordinates.coordinates[0] }
    : undefined;

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
 * This queries the live Socrata API - no local data needed!
 */
export async function queryPropertiesFromSocrata(
  filters: SearchFilters = {}
): Promise<{ properties: Property[]; count: number }> {
  const queryParams = buildSoQLQuery(filters);
  const url = `${SOCRATA_BASE_URL}?${queryParams.toString()}`;

  console.log('[Socrata] Query URL:', url);

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      // Note: Add X-App-Token for production to avoid rate limits
    },
  });

  if (!response.ok) {
    throw new Error(`Socrata API error: ${response.status} ${response.statusText}`);
  }

  const rawProperties = (await response.json()) as SocrataProperty[];
  const properties = rawProperties.map(transformProperty);

  // Get total count via a separate count query
  const countParams = new URLSearchParams();
  const whereClauses = queryParams.get('$where');
  if (whereClauses) {
    countParams.set('$where', whereClauses);
  }
  countParams.set('$select', 'count(*)');

  const countUrl = `${SOCRATA_BASE_URL}?${countParams.toString()}`;
  const countResponse = await fetch(countUrl);
  const countData = (await countResponse.json()) as Array<{ count?: string }>;
  const totalCount = countData[0]?.count ? parseInt(countData[0].count) : properties.length;

  return { properties, count: totalCount };
}

/** Metadata about the dataset - domains and ranges */
export interface DatasetMetadata {
  cities: string[];
  priceRange: { min: number; max: number };
  propertyTypes: string[];
  residentialTypes: string[];
  totalRecords: number;
  lastUpdated: string;
}

/** Cached metadata to avoid repeated API calls */
let cachedMetadata: DatasetMetadata | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour cache

/**
 * Get dataset metadata - cities, price ranges, property types
 * Results are cached for 1 hour to minimize API calls
 */
export async function getDatasetMetadata(): Promise<DatasetMetadata> {
  const now = Date.now();
  if (cachedMetadata && now - cacheTimestamp < CACHE_TTL_MS) {
    console.log('[Socrata] Using cached metadata');
    return cachedMetadata;
  }

  console.log('[Socrata] Fetching dataset metadata...');

  // Run all metadata queries in parallel
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
async function fetchDistinctValues(column: string, limit: number): Promise<string[]> {
  const params = new URLSearchParams({
    '$select': `distinct ${column}`,
    '$order': column,
    '$where': "listyear >= '2020'",
    '$limit': String(limit),
  });

  const response = await fetch(`${SOCRATA_BASE_URL}?${params.toString()}`);
  if (!response.ok) return [];

  const data = (await response.json()) as Array<Record<string, string>>;
  return data.map((row) => row[column]).filter(Boolean);
}

/** Fetch min/max price range */
async function fetchPriceRange(): Promise<{ min: number; max: number }> {
  const params = new URLSearchParams({
    '$select': 'min(saleamount) as min_price, max(saleamount) as max_price',
    '$where': "listyear >= '2020' AND saleamount > 10000",
  });

  const response = await fetch(`${SOCRATA_BASE_URL}?${params.toString()}`);
  if (!response.ok) return { min: 50000, max: 5000000 };

  const data = (await response.json()) as Array<{ min_price?: string; max_price?: string }>;
  return {
    min: Number(data[0]?.min_price) || 50000,
    max: Number(data[0]?.max_price) || 5000000,
  };
}

/** Fetch total record count and most recent date */
async function fetchRecordCount(): Promise<{ count: number; lastDate: string }> {
  const params = new URLSearchParams({
    '$select': 'count(*) as total, max(daterecorded) as last_date',
    '$where': "listyear >= '2020'",
  });

  const response = await fetch(`${SOCRATA_BASE_URL}?${params.toString()}`);
  if (!response.ok) return { count: 0, lastDate: '' };

  const data = (await response.json()) as Array<{ total?: string; last_date?: string }>;
  return {
    count: Number(data[0]?.total) || 0,
    lastDate: data[0]?.last_date || '',
  };
}

/**
 * Get list of all CT cities/towns from Socrata
 * @deprecated Use getDatasetMetadata().cities instead
 */
export async function getCitiesFromSocrata(): Promise<string[]> {
  const metadata = await getDatasetMetadata();
  return metadata.cities;
}
