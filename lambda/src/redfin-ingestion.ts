/**
 * Redfin CSV Ingestion Lambda
 * Downloads monthly market data CSVs from Redfin Data Center
 * Parses and stores in DynamoDB market_metrics table
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { parse } from 'csv-parse/sync';
import { Context, ScheduledEvent } from 'aws-lambda';

const s3Client = new S3Client({});
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const REDFIN_DATA_URLS = {
  city_market_tracker: 'https://redfin-public-data.s3.us-west-2.amazonaws.com/redfin_market_tracker/city_market_tracker.tsv000.gz',
  zip_market_tracker: 'https://redfin-public-data.s3.us-west-2.amazonaws.com/redfin_market_tracker/zip_code_market_tracker.tsv000.gz'
};

const BUCKET_NAME = process.env.DATA_BUCKET || 'home-harbor-data-sources-dev';
const TABLE_NAME = process.env.METRICS_TABLE || 'home-harbor-market-metrics-dev';

interface RedfinRecord {
  period_begin: string;
  period_end: string;
  period_duration: string;
  region_type: string;
  region_type_id: string;
  table_id: string;
  is_seasonally_adjusted: string;
  city: string;
  state: string;
  state_code: string;
  property_type: string;
  median_sale_price: string;
  median_list_price: string;
  median_ppsf: string;
  median_list_ppsf: string;
  homes_sold: string;
  inventory: string;
  months_of_supply: string;
  median_dom: string;
  avg_sale_to_list: string;
  sold_above_list: string;
  parent_metro_region: string;
  last_updated: string;
}

interface MarketMetric {
  market_id: string;
  period: string;
  city: string;
  state: string;
  state_code: string;
  property_type: string;
  median_sale_price: number | null;
  median_list_price: number | null;
  median_ppsf: number | null;
  homes_sold: number | null;
  inventory: number | null;
  months_of_supply: number | null;
  median_days_on_market: number | null;
  pct_sold_above_list: number | null;
  avg_sale_to_list_ratio: number | null;
  metro_region: string | null;
  data_source: string;
  updated_at: string;
}

/**
 * Download and decompress TSV file from Redfin
 */
async function downloadRedfinData(url: string): Promise<string> {
  console.log(`Downloading data from: ${url}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'HomeHarbor/1.0 (Educational Project)'
    },
    signal: AbortSignal.timeout(60000) // 60 second timeout
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  
  // Decompress gzip
  const zlib = await import('zlib');
  const decompressed = zlib.gunzipSync(Buffer.from(arrayBuffer));
  
  return decompressed.toString('utf-8');
}

/**
 * Parse TSV data into structured records
 */
function parseRedfinTSV(tsvData: string): RedfinRecord[] {
  const records = parse(tsvData, {
    delimiter: '\t',
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true
  }) as RedfinRecord[];
  
  console.log(`Parsed ${records.length} records from TSV`);
  return records;
}

/**
 * Transform Redfin record to DynamoDB format
 */
function transformRecord(record: RedfinRecord): MarketMetric | null {
  // Only process city-level data for now
  if (record.region_type !== 'city') {
    return null;
  }
  
  // Skip records with missing critical data
  if (!record.city || !record.state_code || !record.period_end) {
    return null;
  }
  
  const parseNumber = (val: string): number | null => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? null : parsed;
  };
  
  const parsePercentage = (val: string): number | null => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? null : parsed / 100; // Convert to decimal
  };
  
  return {
    market_id: `${record.city}-${record.state_code}`,
    period: record.period_end.substring(0, 7), // YYYY-MM
    city: record.city,
    state: record.state || record.state_code,
    state_code: record.state_code,
    property_type: record.property_type || 'All Residential',
    median_sale_price: parseNumber(record.median_sale_price),
    median_list_price: parseNumber(record.median_list_price),
    median_ppsf: parseNumber(record.median_ppsf),
    homes_sold: parseNumber(record.homes_sold),
    inventory: parseNumber(record.inventory),
    months_of_supply: parseNumber(record.months_of_supply),
    median_days_on_market: parseNumber(record.median_dom),
    pct_sold_above_list: parsePercentage(record.sold_above_list),
    avg_sale_to_list_ratio: parsePercentage(record.avg_sale_to_list),
    metro_region: record.parent_metro_region || null,
    data_source: 'redfin_data_center',
    updated_at: new Date().toISOString()
  };
}

/**
 * Save raw data to S3
 */
async function saveToS3(key: string, data: string): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: data,
    ContentType: 'text/tab-separated-values'
  });
  
  await s3Client.send(command);
  console.log(`Saved raw data to S3: s3://${BUCKET_NAME}/${key}`);
}

/**
 * Batch write records to DynamoDB
 */
async function saveToDynamoDB(metrics: MarketMetric[]): Promise<void> {
  const BATCH_SIZE = 25; // DynamoDB batch write limit
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < metrics.length; i += BATCH_SIZE) {
    const batch = metrics.slice(i, i + BATCH_SIZE);
    
    const putRequests = batch.map(metric => ({
      PutRequest: {
        Item: metric
      }
    }));
    
    try {
      await dynamoClient.send(new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: putRequests
        }
      }));
      
      successCount += batch.length;
      console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: Saved ${batch.length} metrics`);
    } catch (error) {
      errorCount += batch.length;
      console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error);
    }
  }
  
  console.log(`DynamoDB write complete: ${successCount} succeeded, ${errorCount} failed`);
}

/**
 * Filter for recent data (last 12 months)
 */
function filterRecentData(metrics: MarketMetric[]): MarketMetric[] {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  const cutoffPeriod = twelveMonthsAgo.toISOString().substring(0, 7);
  
  return metrics.filter(m => m.period >= cutoffPeriod);
}

/**
 * Main Lambda handler
 */
export async function handler(event: ScheduledEvent, context: Context) {
  console.log('Redfin ingestion started');
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const startTime = Date.now();
  const results = {
    downloaded: 0,
    parsed: 0,
    transformed: 0,
    saved: 0
  };
  
  try {
    // Download city market data
    const tsvData = await downloadRedfinData(REDFIN_DATA_URLS.city_market_tracker);
    results.downloaded = tsvData.length;
    
    // Save raw data to S3
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await saveToS3(`redfin/raw/city_market_tracker_${timestamp}.tsv`, tsvData);
    
    // Parse TSV
    const records = parseRedfinTSV(tsvData);
    results.parsed = records.length;
    
    // Transform to DynamoDB format
    const metrics = records
      .map(transformRecord)
      .filter((m): m is MarketMetric => m !== null);
    results.transformed = metrics.length;
    
    // Filter for recent data only (last 12 months)
    const recentMetrics = filterRecentData(metrics);
    console.log(`Filtered to ${recentMetrics.length} recent records (last 12 months)`);
    
    // Save to DynamoDB
    await saveToDynamoDB(recentMetrics);
    results.saved = recentMetrics.length;
    
    const duration = Date.now() - startTime;
    
    console.log('Ingestion complete:', {
      ...results,
      duration_ms: duration
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Redfin data ingestion successful',
        results,
        duration_ms: duration
      })
    };
    
  } catch (error) {
    console.error('Ingestion failed:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Redfin data ingestion failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      })
    };
  }
}
