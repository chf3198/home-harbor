import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const secretsClient = new SecretsManagerClient({});

const AI_INSIGHTS_TABLE = process.env.AI_INSIGHTS_TABLE || 'home-harbor-ai-insights-dev';
const SECRETS_NAME = process.env.SECRETS_NAME || 'home-harbor-secrets-dev';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const handler = async (event: any) => {
  try {
    const { address } = JSON.parse(event.body || '{}');

    if (!address) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Address is required' }),
      };
    }

    // Generate Street View URL (simplified)
    const imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=640x480&location=${encodeURIComponent(address)}&key=DEMO_KEY`; // Use actual key from secrets

    // Check cache
    const cacheKey = `vision_${address}`;
    const getCommand = new GetCommand({
      TableName: AI_INSIGHTS_TABLE,
      Key: { id: cacheKey },
    });
    const cached = await dynamoClient.send(getCommand);
    if (cached.Item && !event.force_refresh) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ ...cached.Item, cached: true }),
      };
    }

    // Get API key
    const secretCommand = new GetSecretValueCommand({ SecretId: SECRETS_NAME });
    const secret = await secretsClient.send(secretCommand);
    const secrets = JSON.parse(secret.SecretString || '{}');
    const apiKey = secrets.openrouter_api_key;

    // Call OpenRouter
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'allenai/molmo-7b',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this property exterior photo and provide insights on architectural style, condition, features, etc.' },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;

    // Cache result
    const putCommand = new PutCommand({
      TableName: AI_INSIGHTS_TABLE,
      Item: {
        id: cacheKey,
        address,
        insights,
        analyzed_at: new Date().toISOString(),
        model: 'allenai/molmo-7b'
      }
    });
    await dynamoClient.send(putCommand);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ address, insights, cached: false, model: 'allenai/molmo-7b', analyzed_at: new Date().toISOString() }),
    };
  } catch (error) {
    console.error('Error analyzing property:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};