/**
 * OpenRouter AI Vision Analysis Lambda
 * Uses Molmo2-8B vision model to analyze property photos
 * Caches results in DynamoDB ai_insights table
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

interface VisionAnalysisRequest {
  property_id: string;
  image_url: string;
  force_refresh?: boolean;
}

interface VisionInsights {
  architectural_style: string;
  exterior_condition: number; // 1-10
  visible_features: string[];
  curb_appeal_score: number; // 1-10
  maintenance_level: 'Low' | 'Medium' | 'High';
  neighborhood_quality: string;
  estimated_age: string;
  notable_highlights: string[];
  potential_concerns: string[];
}

interface VisionAnalysisResponse {
  property_id: string;
  insights: VisionInsights;
  cached: boolean;
  model: string;
  analyzed_at: string;
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
 * Check if analysis exists in cache
 */
async function getCachedAnalysis(propertyId: string): Promise<VisionInsights | null> {
  try {
    const result = await dynamoClient.send(new GetCommand({
      TableName: AI_CACHE_TABLE,
      Key: {
        property_id: propertyId,
        analysis_type: 'vision'
      }
    }));
    
    if (result.Item && result.Item.insights) {
      console.log(`Found cached analysis for property: ${propertyId}`);
      return result.Item.insights as VisionInsights;
    }
    
    return null;
  } catch (error) {
    console.error('Error checking cache:', error);
    return null;
  }
}

/**
 * Analyze property image using Molmo2-8B vision model
 */
async function analyzePropertyImage(imageUrl: string, apiKey: string): Promise<VisionInsights> {
  console.log(`Analyzing image: ${imageUrl}`);
  
  const prompt = `Analyze this residential property photo and provide detailed insights in JSON format with the following fields:

{
  "architectural_style": "Describe the architectural style (e.g., Colonial, Ranch, Victorian, Contemporary, Craftsman, etc.)",
  "exterior_condition": <number 1-10>,
  "visible_features": ["List visible features like garage, porch, deck, landscaping, driveway, etc."],
  "curb_appeal_score": <number 1-10>,
  "maintenance_level": "Low | Medium | High",
  "neighborhood_quality": "Describe visible neighborhood indicators (street quality, surrounding homes, etc.)",
  "estimated_age": "Approximate age or era of construction",
  "notable_highlights": ["List positive aspects and selling points"],
  "potential_concerns": ["List any visible maintenance issues or concerns"]
}

Be specific and detailed. Base your analysis only on what is visible in the image.`;

  const requestBody = {
    model: 'allenai/molmo-72b-0924', // Updated model name
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl
            }
          }
        ]
      }
    ],
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: 'json_object' }
  };
  
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://home-harbor.example.com',
      'X-Title': 'HomeHarbor AI Property Analysis'
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(60000)
  });
  
  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  const content = data.choices[0].message.content;
  console.log('Raw AI response:', content);
  
  // Parse JSON response
  let insights: VisionInsights;
  try {
    insights = JSON.parse(content);
  } catch (parseError) {
    console.error('Failed to parse AI response as JSON:', content);
    throw new Error('AI response was not valid JSON');
  }
  
  // Validate and normalize insights
  return {
    architectural_style: insights.architectural_style || 'Unknown',
    exterior_condition: normalizeScore(insights.exterior_condition),
    visible_features: Array.isArray(insights.visible_features) ? insights.visible_features : [],
    curb_appeal_score: normalizeScore(insights.curb_appeal_score),
    maintenance_level: normalizeMaintenanceLevel(insights.maintenance_level),
    neighborhood_quality: insights.neighborhood_quality || 'Not visible in image',
    estimated_age: insights.estimated_age || 'Unknown',
    notable_highlights: Array.isArray(insights.notable_highlights) ? insights.notable_highlights : [],
    potential_concerns: Array.isArray(insights.potential_concerns) ? insights.potential_concerns : []
  };
}

/**
 * Normalize score to 1-10 range
 */
function normalizeScore(score: any): number {
  const num = parseFloat(score);
  if (isNaN(num)) return 5;
  return Math.max(1, Math.min(10, Math.round(num)));
}

/**
 * Normalize maintenance level
 */
function normalizeMaintenanceLevel(level: any): 'Low' | 'Medium' | 'High' {
  if (typeof level === 'string') {
    const normalized = level.toLowerCase();
    if (normalized.includes('low')) return 'Low';
    if (normalized.includes('high')) return 'High';
  }
  return 'Medium';
}

/**
 * Save analysis to DynamoDB cache
 */
async function cacheAnalysis(propertyId: string, insights: VisionInsights): Promise<void> {
  await dynamoClient.send(new PutCommand({
    TableName: AI_CACHE_TABLE,
    Item: {
      property_id: propertyId,
      analysis_type: 'vision',
      insights,
      model: 'molmo-72b',
      analyzed_at: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // 90 days TTL
    }
  }));
  
  console.log(`Cached analysis for property: ${propertyId}`);
}

/**
 * Main Lambda handler
 */
export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  console.log('Vision analysis requested');
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
    
    const request: VisionAnalysisRequest = JSON.parse(event.body);
    
    // Validate request
    if (!request.property_id || !request.image_url) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'property_id and image_url are required'
        })
      };
    }
    
    // Check cache unless force refresh
    if (!request.force_refresh) {
      const cached = await getCachedAnalysis(request.property_id);
      
      if (cached) {
        const response: VisionAnalysisResponse = {
          property_id: request.property_id,
          insights: cached,
          cached: true,
          model: 'molmo-72b',
          analyzed_at: new Date().toISOString()
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
    
    // Analyze image
    const insights = await analyzePropertyImage(request.image_url, apiKey);
    
    // Cache results
    await cacheAnalysis(request.property_id, insights);
    
    const response: VisionAnalysisResponse = {
      property_id: request.property_id,
      insights,
      cached: false,
      model: 'molmo-72b',
      analyzed_at: new Date().toISOString()
    };
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    console.error('Vision analysis failed:', error);
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to analyze property image'
      })
    };
  }
}
