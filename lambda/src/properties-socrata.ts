/**
 * @fileoverview Properties API Handler - Socrata Edition
 * @description GET /properties endpoint querying CT Open Data Portal directly
 * @semantic properties, api, socrata, serverless
 */

import { queryPropertiesFromSocrata, getDatasetMetadata } from './socrata-service';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Lambda handler for GET /properties
 * Queries CT Open Data Portal via Socrata API based on filter parameters
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const params = event.queryStringParameters || {};

    // Parse query parameters
    const pageSize = params.limit ? Math.min(parseInt(params.limit), 100) : 50;
    const filters = {
      city: params.city || null,
      minPrice: params.minPrice ? parseInt(params.minPrice) : null,
      maxPrice: params.maxPrice ? parseInt(params.maxPrice) : null,
      propertyType: params.propertyType || null,
      residentialType: params.residentialType || null,
      limit: pageSize,
      offset: params.page ? (parseInt(params.page) - 1) * pageSize : 0,
    };

    console.log('[Properties] Filters:', JSON.stringify(filters));

    // Query Socrata API
    const { properties, count } = await queryPropertiesFromSocrata(filters);

    // Calculate pagination
    const page = params.page ? parseInt(params.page) : 1;
    const limit = filters.limit || 50;
    const totalPages = Math.ceil(count / limit);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        data: properties,
        meta: {
          page,
          pageSize: limit,
          totalItems: count,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        filters: {
          city: filters.city,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          propertyType: filters.propertyType,
          residentialType: filters.residentialType,
        },
        source: 'CT Open Data Portal',
      }),
    };
  } catch (error) {
    console.error('[Properties] Error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Failed to fetch properties',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

/**
 * Lambda handler for GET /cities
 * Returns list of available CT cities from Socrata
 */
export const citiesHandler = async (): Promise<APIGatewayProxyResult> => {
  try {
    const metadata = await getDatasetMetadata();

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ cities: metadata.cities }),
    };
  } catch (error) {
    console.error('[Cities] Error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Failed to fetch cities',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

/**
 * Lambda handler for GET /metadata
 * Returns dataset metadata: cities, price ranges, property types
 * Used by AI to understand available data domains
 */
export const metadataHandler = async (): Promise<APIGatewayProxyResult> => {
  try {
    const metadata = await getDatasetMetadata();

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        ...metadata,
        description: 'CT Real Estate Sales 2020+ from CT Open Data Portal',
        source: 'https://data.ct.gov/resource/5mzw-sjtu',
      }),
    };
  } catch (error) {
    console.error('[Metadata] Error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Failed to fetch metadata',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
