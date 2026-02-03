/**
 * @fileoverview Search API Handler
 * @description GET /search endpoint for advanced property search
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.PROPERTIES_TABLE || 'home-harbor-properties-dev';

/**
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} API response
 */
exports.handler = async (event) => {
  try {
    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit) || 50;
    const offset = parseInt(queryParams.offset) || 0;
    const sortBy = queryParams.sortBy || 'price';
    const sortOrder = queryParams.sortOrder || 'asc';

    // Build filter expression
    let filterExpression = undefined;
    let expressionAttributeValues = undefined;

    // City filter
    if (queryParams.city) {
      filterExpression = 'city = :city';
      expressionAttributeValues = { ':city': queryParams.city };
    }

    // Price range
    if (queryParams.minPrice) {
      const minPrice = parseInt(queryParams.minPrice);
      if (filterExpression) {
        filterExpression += ' AND price >= :minPrice';
      } else {
        filterExpression = 'price >= :minPrice';
      }
      expressionAttributeValues = { ...expressionAttributeValues, ':minPrice': minPrice };
    }

    if (queryParams.maxPrice) {
      const maxPrice = parseInt(queryParams.maxPrice);
      if (filterExpression) {
        filterExpression += ' AND price <= :maxPrice';
      } else {
        filterExpression = 'price <= :maxPrice';
      }
      expressionAttributeValues = { ...expressionAttributeValues, ':maxPrice': maxPrice };
    }

    // Property type
    if (queryParams.propertyType) {
      if (filterExpression) {
        filterExpression += ' AND propertyType = :propertyType';
      } else {
        filterExpression = 'propertyType = :propertyType';
      }
      expressionAttributeValues = { ...expressionAttributeValues, ':propertyType': queryParams.propertyType };
    }

    const params = {
      TableName: TABLE_NAME,
      ...(filterExpression && {
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues,
      }),
    };

    const result = await dynamoClient.send(new ScanCommand(params));
    let items = result.Items || [];

    // Apply sorting
    items.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return aVal < bVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });

    // Apply pagination
    const paginatedItems = items.slice(offset, offset + limit);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
      },
      body: JSON.stringify({
        properties: paginatedItems,
        totalCount: items.length,
        limit,
        offset,
        sortBy,
        sortOrder,
      }),
    };
  } catch (error) {
    console.error('Search API error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};