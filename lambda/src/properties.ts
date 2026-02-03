import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.PROPERTIES_TABLE || 'home-harbor-properties-dev';

export const handler = async (event: any) => {
  try {
    const { city, priceMin, priceMax, type } = event.queryStringParameters || {};

    let filterExpression = '';
    let expressionAttributeValues: any = {};
    let expressionAttributeNames: any = {};

    if (city) {
      filterExpression += 'city = :city';
      expressionAttributeValues[':city'] = city;
    }

    if (priceMin) {
      if (filterExpression) filterExpression += ' AND ';
      filterExpression += '#price >= :priceMin';
      expressionAttributeValues[':priceMin'] = parseInt(priceMin);
      expressionAttributeNames['#price'] = 'price';
    }

    if (priceMax) {
      if (filterExpression) filterExpression += ' AND ';
      filterExpression += '#price <= :priceMax';
      expressionAttributeValues[':priceMax'] = parseInt(priceMax);
    }

    if (type) {
      if (filterExpression) filterExpression += ' AND ';
      filterExpression += '#type = :type';
      expressionAttributeValues[':type'] = type;
      expressionAttributeNames['#type'] = 'type';
    }

    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: filterExpression || undefined,
      ExpressionAttributeValues: Object.keys(expressionAttributeValues).length ? expressionAttributeValues : undefined,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length ? expressionAttributeNames : undefined,
    });

    const response = await docClient.send(command);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ properties: response.Items }),
    };
  } catch (error) {
    console.error('Error fetching properties:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};