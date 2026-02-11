/**
 * @fileoverview Property enrichment service using CT CAMA data
 * Fetches additional property details (beds, baths, sqft, etc.) from CAMA API
 */

const ENRICH_API_URL = 'https://n5hclfza8a.execute-api.us-east-1.amazonaws.com/prod/enrich';

/**
 * Enrich a single property with CAMA data
 * @param {Object} property - Property object with address and city
 * @returns {Promise<Object>} Enhanced property object
 */
export async function enrichProperty(property) {
  if (!property?.address || !property?.city) {
    console.warn('[enrichProperty] Missing address or city:', property);
    return property;
  }

  try {
    const params = new URLSearchParams({
      address: property.address,
      town: property.city,
    });

    const response = await fetch(`${ENRICH_API_URL}?${params}`);
    
    if (!response.ok) {
      console.warn(`[enrichProperty] API error for ${property.address}:`, response.status);
      return property;
    }

    const data = await response.json();
    
    if (!data.success || !data.enrichment) {
      console.warn(`[enrichProperty] No enrichment data for ${property.address}`);
      return property;
    }

    // Merge enrichment data into property.metadata
    const enriched = {
      ...property,
      metadata: {
        ...property.metadata,
        bedrooms: data.enrichment.beds,
        bathrooms: data.enrichment.baths,
        halfBathrooms: data.enrichment.halfBaths,
        squareFeet: data.enrichment.sqft,
        lotSize: data.enrichment.lotAcres,
        yearBuilt: data.enrichment.yearBuilt,
        style: data.enrichment.style,
        condition: data.enrichment.condition,
        heating: data.enrichment.heating,
        cooling: data.enrichment.cooling,
        photoUrl: data.enrichment.photoUrl,
        appraisedValue: data.enrichment.appraisedValue,
        enrichedAt: new Date().toISOString(),
        enrichmentSource: data.enrichment.source,
      },
    };

    console.log(`[enrichProperty] Enriched ${property.address}:`, enriched.metadata);
    return enriched;
  } catch (error) {
    console.error(`[enrichProperty] Error enriching ${property.address}:`, error);
    return property;
  }
}

/**
 * Enrich multiple properties with CAMA data
 * @param {Array<Object>} properties - Array of property objects
 * @param {number} maxConcurrent - Maximum concurrent enrichment requests (default: 3)
 * @returns {Promise<Array<Object>>} Array of enriched properties
 */
export async function enrichProperties(properties, maxConcurrent = 3) {
  if (!Array.isArray(properties) || properties.length === 0) {
    return properties;
  }

  console.log(`[enrichProperties] Enriching ${properties.length} properties (max ${maxConcurrent} concurrent)...`);
  
  const enriched = [];
  
  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < properties.length; i += maxConcurrent) {
    const batch = properties.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map(property => enrichProperty(property))
    );
    enriched.push(...batchResults);
  }

  const successCount = enriched.filter(p => p.metadata?.enrichedAt).length;
  console.log(`[enrichProperties] Successfully enriched ${successCount}/${properties.length} properties`);

  return enriched;
}
