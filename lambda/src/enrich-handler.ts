/**
 * @fileoverview Property Enrichment Lambda Handler
 * @description GET /enrich endpoint that adds CAMA data (beds, baths, sqft) to properties
 */

import { queryCamaByAddress, queryCamaByTown, getCamaCountByTown } from './cama-service';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Lambda handler for GET /enrich
 * Enriches a single property with CAMA data
 * Query params: address (required), town (required)
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const params = event.queryStringParameters || {};
    const { address, town } = params;

    if (!address || !town) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Missing required parameters',
          required: ['address', 'town'],
        }),
      };
    }

    console.log('[Enrich] Request for:', address, town);

    const enrichment = await queryCamaByAddress(address, town);

    if (!enrichment) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Property not found in CAMA database',
          address,
          town,
          suggestion: 'CAMA data may not be available for this property',
        }),
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        address,
        town,
        enrichment,
      }),
    };
  } catch (error) {
    console.error('[Enrich] Error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Failed to enrich property',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

/**
 * Lambda handler for GET /enrich/bulk
 * Returns CAMA data for all properties in a town (paginated)
 * Query params: town (required), limit (optional, max 100), offset (optional)
 */
export const bulkHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const params = event.queryStringParameters || {};
    const { town } = params;
    const limit = Math.min(parseInt(params.limit || '50'), 100);
    const offset = parseInt(params.offset || '0');

    if (!town) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Missing required parameter: town',
        }),
      };
    }

    console.log('[Enrich/Bulk] Request for:', town, 'limit:', limit, 'offset:', offset);

    const [enrichments, totalCount] = await Promise.all([
      queryCamaByTown(town, limit, offset),
      getCamaCountByTown(town),
    ]);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        town,
        data: enrichments,
        meta: {
          limit,
          offset,
          count: enrichments.length,
          totalAvailable: totalCount,
          hasMore: offset + enrichments.length < totalCount,
        },
      }),
    };
  } catch (error) {
    console.error('[Enrich/Bulk] Error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Failed to fetch bulk enrichment',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
