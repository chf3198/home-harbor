import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import axios from 'axios';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const secretsClient = new SecretsManagerClient({});

const AI_INSIGHTS_TABLE = process.env.AI_INSIGHTS_TABLE || 'home-harbor-ai-insights-dev';
const SECRETS_NAME = process.env.SECRETS_NAME || 'home-harbor-secrets-dev';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const handler = async (event: any) => {
  try {
    const { property_id, property_data, market_data, vision_insights } = JSON.parse(event.body || '{}');

    if (!property_data) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Property data is required' }),
      };
    }

    // Check cache
    const cacheKey = `desc_${property_id || property_data.address}`;
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

    // Prepare prompt
    const prompt = `Generate a compelling real estate listing description for this property: ${JSON.stringify(property_data)}. Market data: ${JSON.stringify(market_data || {})}. Vision insights: ${JSON.stringify(vision_insights || {})}`;

    // Call OpenRouter
    const response = await axios.post(OPENROUTER_API_URL, {
      model: 'meta-llama/llama-3.3-70b-instruct',
      messages: [
        { role: 'user', content: prompt }
      ]
    }, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const description = response.data.choices[0].message.content;

    // Cache result
    const putCommand = new PutCommand({
      TableName: AI_INSIGHTS_TABLE,
      Item: {
        id: cacheKey,
        property_data,
        description,
        generated_at: new Date().toISOString(),
        model: 'meta-llama/llama-3.3-70b-instruct'
      }
    });
    await dynamoClient.send(putCommand);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ property_data, description, cached: false, model: 'meta-llama/llama-3.3-70b-instruct', generated_at: new Date().toISOString() }),
    };
  } catch (error) {
    console.error('Error generating description:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};