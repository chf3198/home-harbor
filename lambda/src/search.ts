import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.PROPERTIES_TABLE || 'home-harbor-properties-dev';

export const handler = async (event: any) => {
  try {
    const { q, sortBy = 'price', order = 'asc', limit = 10, offset = 0 } = event.queryStringParameters || {};

    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const response = await docClient.send(command);
    let items = response.Items || [];

    // Simple search filter
    if (q) {
      items = items.filter(item =>
        item.address?.toLowerCase().includes(q.toLowerCase()) ||
        item.city?.toLowerCase().includes(q.toLowerCase())
      );
    }

    // Sorting
    items.sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      if (order === 'desc') {
        return bVal - aVal;
      }
      return aVal - bVal;
    });

    // Pagination
    const start = parseInt(offset);
    const end = start + parseInt(limit);
    const paginatedItems = items.slice(start, end);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        properties: paginatedItems,
        total: items.length,
        limit: parseInt(limit),
        offset: start
      }),
    };
  } catch (error) {
    console.error('Error searching properties:', error);
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