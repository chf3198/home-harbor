/**
 * @fileoverview Properties API Handler
 * @description GET /properties endpoint for retrieving property listings
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

    // Build filter expression if filters provided
    let filterExpression = undefined;
    let expressionAttributeValues = undefined;

    if (queryParams.city) {
      filterExpression = 'city = :city';
      expressionAttributeValues = { ':city': queryParams.city };
    }

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

    const params = {
      TableName: TABLE_NAME,
      Limit: limit,
      ...(filterExpression && {
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues,
      }),
    };

    const result = await dynamoClient.send(new ScanCommand(params));

    // Apply offset manually since DynamoDB Scan doesn't support offset directly
    const items = result.Items || [];
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
        totalCount: result.Count || 0,
        limit,
        offset,
      }),
    };
  } catch (error) {
    console.error('Properties API error:', error);
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