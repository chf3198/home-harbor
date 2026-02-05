/**
 * OpenRouter LLM Property Description Generator
 * Uses Llama 3.3 70B to generate compelling property descriptions
 * Combines property data, market metrics, and vision insights
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const secretsClient = new SecretsManagerClient({});

const AI_CACHE_TABLE = process.env.AI_CACHE_TABLE || 'home-harbor-ai-insights-dev';
const SECRET_NAME = process.env.SECRET_NAME || 'home-harbor/api-keys-dev';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface PropertyDescriptionRequest {
  property_id: string;
  property_data: {
    address: string;
    city: string;
    state: string;
    price: number;
    bedrooms?: number;
    bathrooms?: number;
    sqft?: number;
    property_type?: string;
    year_built?: number;
  };
  market_data?: {
    median_market_price?: number;
    median_days_on_market?: number;
    market_trend?: string;
  };
  vision_insights?: any;
  force_refresh?: boolean;
}

// OpenRouter API response type
interface OpenRouterResponse {
  choices: Array<{ message: { content: string } }>;
}

interface PropertyDescription {
  headline: string;
  summary: string;
  highlights: string[];
  market_position: string;
  neighborhood_context: string;
  full_description: string;
}

interface DescriptionResponse {
  property_id: string;
  description: PropertyDescription;
  cached: boolean;
  model: string;
  generated_at: string;
}

let cachedApiKey: string | null = null;

/**
 * Get OpenRouter API key from Secrets Manager
 */
async function getApiKey(): Promise<string> {
  if (cachedApiKey) {
    return cachedApiKey;
  }
  
  const command = new GetSecretValueCommand({
    SecretId: SECRET_NAME
  });
  
  const response = await secretsClient.send(command);
  
  if (!response.SecretString) {
    throw new Error('Secret value is empty');
  }
  
  const secrets = JSON.parse(response.SecretString);
  cachedApiKey = secrets.OPENROUTER_API_KEY;
  
  if (!cachedApiKey || cachedApiKey === 'PLACEHOLDER_UPDATE_THIS') {
    throw new Error('OpenRouter API key not configured');
  }
  
  return cachedApiKey;
}

/**
 * Check if description exists in cache
 */
async function getCachedDescription(propertyId: string): Promise<PropertyDescription | null> {
  try {
    const result = await dynamoClient.send(new GetCommand({
      TableName: AI_CACHE_TABLE,
      Key: {
        property_id: propertyId,
        analysis_type: 'description'
      }
    }));
    
    if (result.Item && result.Item.description) {
      console.log(`Found cached description for property: ${propertyId}`);
      return result.Item.description as PropertyDescription;
    }
    
    return null;
  } catch (error) {
    console.error('Error checking cache:', error);
    return null;
  }
}

/**
 * Generate property description using Llama 3.3 70B
 */
async function generateDescription(
  request: PropertyDescriptionRequest,
  apiKey: string
): Promise<PropertyDescription> {
  console.log(`Generating description for property: ${request.property_id}`);
  
  const { property_data, market_data, vision_insights } = request;
  
  // Build context string
  const propertyContext = `
Property Details:
- Address: ${property_data.address}, ${property_data.city}, ${property_data.state}
- Price: $${property_data.price.toLocaleString()}
- Bedrooms: ${property_data.bedrooms || 'Unknown'}
- Bathrooms: ${property_data.bathrooms || 'Unknown'}
- Square Footage: ${property_data.sqft ? property_data.sqft.toLocaleString() + ' sqft' : 'Unknown'}
- Property Type: ${property_data.property_type || 'Residential'}
- Year Built: ${property_data.year_built || 'Unknown'}
`;

  const marketContext = market_data ? `
Market Context:
- Median Market Price: $${market_data.median_market_price?.toLocaleString() || 'Unknown'}
- Median Days on Market: ${market_data.median_days_on_market || 'Unknown'} days
- Market Trend: ${market_data.market_trend || 'Stable'}
` : '';

  const visionContext = vision_insights ? `
Visual Analysis:
- Architectural Style: ${vision_insights.architectural_style}
- Exterior Condition: ${vision_insights.exterior_condition}/10
- Curb Appeal: ${vision_insights.curb_appeal_score}/10
- Visible Features: ${vision_insights.visible_features?.join(', ')}
- Highlights: ${vision_insights.notable_highlights?.join(', ')}
` : '';

  const prompt = `You are a professional real estate copywriter. Generate a compelling property listing description based on the following information:

${propertyContext}
${marketContext}
${visionContext}

Create a JSON response with the following structure:
{
  "headline": "Catchy 8-12 word headline that highlights the key selling point",
  "summary": "Engaging 2-3 sentence overview that captures attention",
  "highlights": ["List 4-6 key features and benefits"],
  "market_position": "1-2 sentences about how this property compares to the market",
  "neighborhood_context": "1-2 sentences about the location and community",
  "full_description": "2-3 paragraph detailed description that tells a story and creates an emotional connection"
}

Guidelines:
- Be enthusiastic but honest
- Focus on benefits, not just features
- Use vivid, descriptive language
- Highlight unique selling points
- Create a sense of urgency when appropriate
- Maintain professional tone
- Avoid clichés and overused phrases`;

  const requestBody = {
    model: 'meta-llama/llama-3.3-70b-instruct',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.8,
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  };
  
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://home-harbor.example.com',
      'X-Title': 'HomeHarbor AI Property Descriptions'
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(60000)
  });
  
  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }
  
  const data = (await response.json()) as OpenRouterResponse;
  const content = data.choices[0].message.content;
  console.log('Raw AI response:', content);
  
  // Parse JSON response
  let description: PropertyDescription;
  try {
    description = JSON.parse(content);
  } catch (parseError) {
    console.error('Failed to parse AI response as JSON:', content);
    throw new Error('AI response was not valid JSON');
  }
  
  // Validate structure
  return {
    headline: description.headline || 'Beautiful Property Available',
    summary: description.summary || '',
    highlights: Array.isArray(description.highlights) ? description.highlights : [],
    market_position: description.market_position || '',
    neighborhood_context: description.neighborhood_context || '',
    full_description: description.full_description || description.summary || ''
  };
}

/**
 * Save description to DynamoDB cache
 */
async function cacheDescription(propertyId: string, description: PropertyDescription): Promise<void> {
  await dynamoClient.send(new PutCommand({
    TableName: AI_CACHE_TABLE,
    Item: {
      property_id: propertyId,
      analysis_type: 'description',
      description,
      model: 'llama-3.3-70b',
      generated_at: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days TTL
    }
  }));
  
  console.log(`Cached description for property: ${propertyId}`);
}

/**
 * Main Lambda handler
 */
export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  console.log('Property description generation requested');
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Request body is required'
        })
      };
    }
    
    const request: PropertyDescriptionRequest = JSON.parse(event.body);
    
    // Validate request
    if (!request.property_id || !request.property_data) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'property_id and property_data are required'
        })
      };
    }
    
    // Check cache unless force refresh
    if (!request.force_refresh) {
      const cached = await getCachedDescription(request.property_id);
      
      if (cached) {
        const response: DescriptionResponse = {
          property_id: request.property_id,
          description: cached,
          cached: true,
          model: 'llama-3.3-70b',
          generated_at: new Date().toISOString()
        };
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(response)
        };
      }
    }
    
    // Get API key
    const apiKey = await getApiKey();
    
    // Generate description
    const description = await generateDescription(request, apiKey);
    
    // Cache results
    await cacheDescription(request.property_id, description);
    
    const response: DescriptionResponse = {
      property_id: request.property_id,
      description,
      cached: false,
      model: 'llama-3.3-70b',
      generated_at: new Date().toISOString()
    };
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    console.error('Description generation failed:', error);
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to generate property description'
      })
    };
  }
}
