/**
 * Connecticut Socrata API ETL Lambda
 * Fetches real estate transaction data from CT Open Data Portal
 * Transforms and loads into DynamoDB properties table
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import axios from 'axios';
import { Context, ScheduledEvent } from 'aws-lambda';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const SOCRATA_ENDPOINT = 'https://data.ct.gov/resource/5mzw-sjtu.json';
const TABLE_NAME = process.env.PROPERTIES_TABLE || 'home-harbor-properties-dev';
const BATCH_SIZE = 1000; // Fetch records in batches

interface CTTransaction {
  serial_number: string;
  list_year: string;
  date_recorded: string;
  town: string;
  address: string;
  assessed_value: string;
  sale_amount: string;
  sales_ratio: string;
  property_type: string;
  residential_type: string;
  non_use_code: string;
  assessor_remarks?: string;
  opm_remarks?: string;
  location?: {
    latitude: string;
    longitude: string;
  };
}

interface Property {
  property_id: string;
  address: string;
  city: string;
  state: string;
  zip: string | null;
  latitude: number | null;
  longitude: number | null;
  price: number;
  assessed_value: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  property_type: string;
  residential_type: string | null;
  last_sale_date: string;
  last_sale_amount: number;
  sales_ratio: number | null;
  year_built: number | null;
  data_source: string;
  is_active_listing: boolean;
  image_url: string | null;
  updated_at: string;
}

/**
 * Fetch transactions from Socrata API with pagination
 */
async function fetchTransactions(
  offset: number = 0,
  limit: number = BATCH_SIZE
): Promise<CTTransaction[]> {
  const params = {
    $limit: limit,
    $offset: offset,
    $order: 'date_recorded DESC',
    $where: `
      date_recorded >= '2023-01-01' AND
      sale_amount > 50000 AND
      property_type = 'Residential' AND
      (non_use_code IS NULL OR non_use_code = '')
    `.replace(/\s+/g, ' ').trim()
  };
  
  console.log(`Fetching transactions: offset=${offset}, limit=${limit}`);
  
  const response = await axios.get<CTTransaction[]>(SOCRATA_ENDPOINT, {
    params,
    timeout: 30000,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'HomeHarbor/1.0 (Educational Project)'
    }
  });
  
  console.log(`Fetched ${response.data.length} transactions`);
  return response.data;
}

/**
 * Transform CT transaction to Property format
 */
function transformTransaction(tx: CTTransaction): Property | null {
  // Skip invalid records
  if (!tx.serial_number || !tx.address || !tx.town || !tx.sale_amount) {
    return null;
  }
  
  const saleAmount = parseFloat(tx.sale_amount);
  if (isNaN(saleAmount) || saleAmount < 50000) {
    return null;
  }
  
  // Parse location if available
  let latitude: number | null = null;
  let longitude: number | null = null;
  
  if (tx.location) {
    latitude = parseFloat(tx.location.latitude);
    longitude = parseFloat(tx.location.longitude);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      latitude = null;
      longitude = null;
    }
  }
  
  // Parse assessed value
  const assessedValue = tx.assessed_value ? parseFloat(tx.assessed_value) : null;
  
  // Parse sales ratio
  const salesRatio = tx.sales_ratio ? parseFloat(tx.sales_ratio) : null;
  
  // Clean address
  const cleanAddress = tx.address.trim();
  
  // Extract property type details
  const residentialType = tx.residential_type || null;
  
  return {
    property_id: `CT-${tx.serial_number}`,
    address: cleanAddress,
    city: tx.town,
    state: 'Connecticut',
    zip: extractZipFromAddress(cleanAddress),
    latitude,
    longitude,
    price: saleAmount,
    assessed_value: assessedValue,
    bedrooms: extractBedroomsFromType(residentialType),
    bathrooms: null,
    sqft: null,
    property_type: tx.property_type,
    residential_type: residentialType,
    last_sale_date: tx.date_recorded,
    last_sale_amount: saleAmount,
    sales_ratio: salesRatio && !isNaN(salesRatio) ? salesRatio : null,
    year_built: null,
    data_source: 'ct_open_data',
    is_active_listing: false, // These are historical sales
    image_url: null,
    updated_at: new Date().toISOString()
  };
}

/**
 * Extract ZIP code from address string (if present)
 */
function extractZipFromAddress(address: string): string | null {
  const zipMatch = address.match(/\b\d{5}(?:-\d{4})?\b/);
  return zipMatch ? zipMatch[0] : null;
}

/**
 * Infer bedroom count from residential type
 */
function extractBedroomsFromType(type: string | null): number | null {
  if (!type) return null;
  
  const typeUpper = type.toUpperCase();
  
  if (typeUpper.includes('ONE FAMILY')) return 3; // Typical single family
  if (typeUpper.includes('TWO FAMILY')) return 2;
  if (typeUpper.includes('THREE FAMILY')) return 1;
  if (typeUpper.includes('CONDO')) return 2;
  if (typeUpper.includes('APARTMENT')) return 1;
  
  return null;
}

/**
 * Geocode address using AWS Location Service (optional enhancement)
 */
async function geocodeAddress(address: string, city: string, state: string): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  // TODO: Implement AWS Location Service geocoding
  // For now, return null if location not provided by CT data
  return null;
}

/**
 * Batch write properties to DynamoDB
 */
async function saveProperties(properties: Property[]): Promise<void> {
  const DYNAMO_BATCH_SIZE = 25; // DynamoDB batch write limit
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < properties.length; i += DYNAMO_BATCH_SIZE) {
    const batch = properties.slice(i, i + DYNAMO_BATCH_SIZE);
    
    const putRequests = batch.map(property => ({
      PutRequest: {
        Item: property
      }
    }));
    
    try {
      await dynamoClient.send(new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: putRequests
        }
      }));
      
      successCount += batch.length;
    } catch (error) {
      errorCount += batch.length;
      console.error(`Batch write failed for ${batch.length} properties:`, error);
    }
  }
  
  console.log(`Saved ${successCount} properties, ${errorCount} errors`);
}

/**
 * Main Lambda handler
 */
export async function handler(event: ScheduledEvent, context: Context) {
  console.log('CT Socrata ETL started');
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const startTime = Date.now();
  const results = {
    fetched: 0,
    transformed: 0,
    saved: 0,
    errors: 0
  };
  
  try {
    // Determine batch parameters
    const maxRecords = process.env.MAX_RECORDS ? parseInt(process.env.MAX_RECORDS) : 5000;
    const batchCount = Math.ceil(maxRecords / BATCH_SIZE);
    
    console.log(`Processing up to ${maxRecords} records in ${batchCount} batches`);
    
    const allProperties: Property[] = [];
    
    // Fetch data in batches
    for (let i = 0; i < batchCount; i++) {
      const offset = i * BATCH_SIZE;
      
      try {
        const transactions = await fetchTransactions(offset, BATCH_SIZE);
        results.fetched += transactions.length;
        
        // Break if no more records
        if (transactions.length === 0) {
          console.log('No more records to fetch');
          break;
        }
        
        // Transform transactions
        const properties = transactions
          .map(transformTransaction)
          .filter((p): p is Property => p !== null);
        
        results.transformed += properties.length;
        allProperties.push(...properties);
        
        // Add delay to avoid rate limiting
        if (i < batchCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (error) {
        console.error(`Batch ${i} failed:`, error);
        results.errors++;
      }
    }
    
    // Save all properties to DynamoDB
    if (allProperties.length > 0) {
      await saveProperties(allProperties);
      results.saved = allProperties.length;
    }
    
    const duration = Date.now() - startTime;
    
    console.log('ETL complete:', {
      ...results,
      duration_ms: duration
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'CT Socrata ETL successful',
        results,
        duration_ms: duration
      })
    };
    
  } catch (error) {
    console.error('ETL failed:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'CT Socrata ETL failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      })
    };
  }
}
