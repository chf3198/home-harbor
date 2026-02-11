/**
 * @fileoverview CAMA (Computer-Assisted Mass Appraisal) Service
 * @description Query CT Open Data Portal for property structural attributes
 * @see https://data.ct.gov/resource/rny9-6ak2.json (2025 CAMA Data)
 */

const CAMA_BASE_URL = 'https://data.ct.gov/resource/rny9-6ak2.json';

/** Raw CAMA property record from Socrata API */
export interface CamaRawProperty {
  link?: string;
  location?: string;
  property_city?: string;
  property_zip?: string;
  number_of_bedroom?: string;
  number_of_baths?: string;
  number_of_half_baths?: string;
  living_area?: string;
  gross_area_of_primary_building?: string;
  land_acres?: string;
  ayb?: string;
  eyb?: string;
  style_desc?: string;
  condition_description?: string;
  stories?: string;
  total_rooms?: string;
  basement_type?: string;
  heat_type_description?: string;
  ac_type_description?: string;
  building_photo?: { url: string };
  assessed_total?: string;
  appraised_total?: string;
}

/** Enriched property attributes from CAMA */
export interface CamaEnrichment {
  beds: number | null;
  baths: number | null;
  halfBaths: number | null;
  sqft: number | null;
  lotAcres: number | null;
  yearBuilt: number | null;
  style: string | null;
  condition: string | null;
  stories: string | null;
  totalRooms: number | null;
  basement: string | null;
  heating: string | null;
  cooling: string | null;
  photoUrl: string | null;
  assessedValue: number | null;
  appraisedValue: number | null;
  source: 'cama_2025';
  fetchedAt: string;
}

/**
 * Normalize address for matching between Sales and CAMA datasets
 * - Uppercase
 * - Remove punctuation
 * - Standardize common abbreviations
 */
export function normalizeAddress(address: string): string {
  return address
    .toUpperCase()
    .replace(/[.,#]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\bSTREET\b/g, 'ST')
    .replace(/\bAVENUE\b/g, 'AVE')
    .replace(/\bROAD\b/g, 'RD')
    .replace(/\bDRIVE\b/g, 'DR')
    .replace(/\bLANE\b/g, 'LN')
    .replace(/\bCOURT\b/g, 'CT')
    .replace(/\bCIRCLE\b/g, 'CIR')
    .replace(/\bBOULEVARD\b/g, 'BLVD')
    .replace(/\bPARKWAY\b/g, 'PKWY')
    .replace(/\bPLACE\b/g, 'PL')
    .trim();
}

/**
 * Normalize town name for CAMA query (Title Case for Socrata)
 */
export function normalizeTown(town: string): string {
  // CAMA uses Title Case (e.g., "Glastonbury", not "GLASTONBURY")
  return town
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
}

/**
 * Parse CAMA photo URL - handles escaped backslashes
 */
function parsePhotoUrl(photo?: { url: string }): string | null {
  if (!photo?.url) return null;
  // Fix escaped backslashes in URL
  return photo.url.replace(/\\\\/g, '/').replace(/\\/g, '/');
}

/**
 * Transform raw CAMA record to enrichment format
 */
function transformCamaProperty(raw: CamaRawProperty): CamaEnrichment {
  return {
    beds: raw.number_of_bedroom ? Math.round(parseFloat(raw.number_of_bedroom)) : null,
    baths: raw.number_of_baths ? Math.round(parseFloat(raw.number_of_baths)) : null,
    halfBaths: raw.number_of_half_baths ? Math.round(parseFloat(raw.number_of_half_baths)) : null,
    sqft: raw.living_area ? Math.round(parseFloat(raw.living_area)) : null,
    lotAcres: raw.land_acres ? parseFloat(raw.land_acres) : null,
    yearBuilt: raw.ayb ? Math.round(parseFloat(raw.ayb)) : null,
    style: raw.style_desc || null,
    condition: raw.condition_description || null,
    stories: raw.stories || null,
    totalRooms: raw.total_rooms ? Math.round(parseFloat(raw.total_rooms)) : null,
    basement: raw.basement_type || null,
    heating: raw.heat_type_description || null,
    cooling: raw.ac_type_description || null,
    photoUrl: parsePhotoUrl(raw.building_photo),
    assessedValue: raw.assessed_total ? parseFloat(raw.assessed_total) : null,
    appraisedValue: raw.appraised_total ? parseFloat(raw.appraised_total) : null,
    source: 'cama_2025',
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Query CAMA data by address and town
 * Returns enrichment data or null if not found
 */
/**
 * Extract street number from address for precise matching
 */
function extractStreetNumber(address: string): string | null {
  const match = address.match(/^(\d+)/);
  return match ? match[1] : null;
}

export async function queryCamaByAddress(
  address: string,
  town: string
): Promise<CamaEnrichment | null> {
  const normalizedTown = normalizeTown(town);
  const normalizedAddress = normalizeAddress(address);
  const streetNumber = extractStreetNumber(normalizedAddress);

  // Build SoQL query - search by town AND address pattern using LIKE
  // Extract the street number and name for more precise matching
  const params = new URLSearchParams();
  
  // Use LIKE for fuzzy address matching (case-insensitive in Socrata)
  const upperTown = normalizedTown.toUpperCase();
  if (streetNumber) {
    // Search for addresses starting with the street number in the specified town
    params.set('$where', `upper(property_city)='${upperTown}' AND location LIKE '${streetNumber} %'`);
  } else {
    params.set('$where', `upper(property_city)='${upperTown}'`);
  }
  params.set('$limit', '20'); // Get candidates for fuzzy matching

  const url = `${CAMA_BASE_URL}?${params.toString()}`;
  console.log('[CAMA] Query URL:', url);

  const response = await fetch(url);
  if (!response.ok) {
    console.error('[CAMA] API error:', response.status, response.statusText);
    return null;
  }

  const results = (await response.json()) as CamaRawProperty[];
  console.log('[CAMA] Found', results.length, 'candidates');
  
  // Find best match by normalized address
  const match = results.find((r) => {
    if (!r.location) return false;
    const camaAddress = normalizeAddress(r.location);
    // Check if addresses match (allowing for partial matches)
    return camaAddress === normalizedAddress || 
           camaAddress.includes(normalizedAddress) ||
           normalizedAddress.includes(camaAddress);
  });

  if (!match) {
    // Log first few results for debugging
    console.log('[CAMA] No exact match. Candidates:', results.slice(0, 3).map(r => r.location));
    return null;
  }

  console.log('[CAMA] Found match:', match.location);
  return transformCamaProperty(match);
}

/**
 * Query CAMA data by town with pagination
 * Useful for bulk enrichment of search results
 */
export async function queryCamaByTown(
  town: string,
  limit: number = 100,
  offset: number = 0
): Promise<CamaEnrichment[]> {
  const normalizedTown = normalizeTown(town);

  const params = new URLSearchParams();
  params.set('$where', `upper(property_city)='${normalizedTown}'`);
  params.set('$limit', String(limit));
  params.set('$offset', String(offset));
  params.set('$order', 'location ASC');

  const url = `${CAMA_BASE_URL}?${params.toString()}`;
  console.log('[CAMA] Bulk query URL:', url);

  const response = await fetch(url);
  if (!response.ok) {
    console.error('[CAMA] API error:', response.status, response.statusText);
    return [];
  }

  const results = (await response.json()) as CamaRawProperty[];
  return results.map(transformCamaProperty);
}

/**
 * Get CAMA record count for a town
 */
export async function getCamaCountByTown(town: string): Promise<number> {
  const normalizedTown = normalizeTown(town);

  const params = new URLSearchParams();
  params.set('$where', `upper(property_city)='${normalizedTown}'`);
  params.set('$select', 'count(*)');

  const url = `${CAMA_BASE_URL}?${params.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) return 0;

  const results = (await response.json()) as Array<{ count?: string }>;
  return results[0]?.count ? parseInt(results[0].count) : 0;
}
