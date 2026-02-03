/**
 * Google Street View Integration Lambda
 * Fetches property exterior photos using Google Street View Static API
 * Caches images in S3 and returns CloudFront URLs
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import axios from 'axios';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const s3Client = new S3Client({});
const secretsClient = new SecretsManagerClient({});

const IMAGE_BUCKET = process.env.IMAGE_BUCKET || 'home-harbor-images-dev';
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || '';
const SECRET_NAME = process.env.SECRET_NAME || 'home-harbor/api-keys-dev';

interface StreetViewRequest {
  property_id: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  heading?: number; // 0-360 degrees
  pitch?: number; // -90 to 90 degrees
  fov?: number; // 10-120 degrees (field of view)
}

interface StreetViewResponse {
  property_id: string;
  image_url: string;
  cached: boolean;
  source: 'street_view' | 'cache';
}

let cachedApiKey: string | null = null;

/**
 * Get Google Maps API key from Secrets Manager
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
  cachedApiKey = secrets.GOOGLE_MAPS_API_KEY;
  
  if (!cachedApiKey || cachedApiKey === 'PLACEHOLDER_UPDATE_THIS') {
    throw new Error('Google Maps API key not configured');
  }
  
  return cachedApiKey;
}

/**
 * Check if image already exists in S3
 */
async function checkImageExists(propertyId: string): Promise<boolean> {
  const key = `properties/${propertyId}.jpg`;
  
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: IMAGE_BUCKET,
      Key: key
    }));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Build Street View Static API URL
 */
function buildStreetViewUrl(
  location: string,
  apiKey: string,
  heading: number = 0,
  pitch: number = 0,
  fov: number = 90
): string {
  const params = new URLSearchParams({
    size: '640x480',
    location,
    heading: heading.toString(),
    pitch: pitch.toString(),
    fov: fov.toString(),
    key: apiKey,
    source: 'outdoor'
  });
  
  return `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;
}

/**
 * Fetch image from Google Street View
 */
async function fetchStreetViewImage(
  location: string,
  apiKey: string,
  heading: number = 0,
  pitch: number = 0,
  fov: number = 90
): Promise<Buffer> {
  const url = buildStreetViewUrl(location, apiKey, heading, pitch, fov);
  
  console.log(`Fetching Street View image for: ${location}`);
  
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 15000
  });
  
  // Check if response is a valid image (Google returns a blank image if no Street View available)
  const buffer = Buffer.from(response.data);
  
  if (buffer.length < 1000) {
    throw new Error('No Street View imagery available for this location');
  }
  
  return buffer;
}

/**
 * Save image to S3
 */
async function saveImageToS3(propertyId: string, imageBuffer: Buffer): Promise<string> {
  const key = `properties/${propertyId}.jpg`;
  
  const command = new PutObjectCommand({
    Bucket: IMAGE_BUCKET,
    Key: key,
    Body: imageBuffer,
    ContentType: 'image/jpeg',
    CacheControl: 'max-age=31536000', // Cache for 1 year
    Metadata: {
      source: 'google_street_view',
      property_id: propertyId,
      fetched_at: new Date().toISOString()
    }
  });
  
  await s3Client.send(command);
  
  console.log(`Saved image to S3: ${key}`);
  
  // Return CloudFront URL if configured, otherwise S3 URL
  if (CLOUDFRONT_DOMAIN) {
    return `https://${CLOUDFRONT_DOMAIN}/${key}`;
  } else {
    return `https://${IMAGE_BUCKET}.s3.amazonaws.com/${key}`;
  }
}

/**
 * Get CloudFront URL for existing image
 */
function getImageUrl(propertyId: string): string {
  const key = `properties/${propertyId}.jpg`;
  
  if (CLOUDFRONT_DOMAIN) {
    return `https://${CLOUDFRONT_DOMAIN}/${key}`;
  } else {
    return `https://${IMAGE_BUCKET}.s3.amazonaws.com/${key}`;
  }
}

/**
 * Main Lambda handler
 */
export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  console.log('Street View fetch requested');
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
    
    const request: StreetViewRequest = JSON.parse(event.body);
    
    // Validate request
    if (!request.property_id) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'property_id is required'
        })
      };
    }
    
    if (!request.address && (!request.latitude || !request.longitude)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Either address or latitude/longitude is required'
        })
      };
    }
    
    // Check if image already exists in cache
    const exists = await checkImageExists(request.property_id);
    
    if (exists) {
      console.log(`Image already cached for property: ${request.property_id}`);
      
      const response: StreetViewResponse = {
        property_id: request.property_id,
        image_url: getImageUrl(request.property_id),
        cached: true,
        source: 'cache'
      };
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response)
      };
    }
    
    // Get API key
    const apiKey = await getApiKey();
    
    // Build location string
    const location = request.address ||
      `${request.latitude},${request.longitude}`;
    
    // Fetch image from Google Street View
    const imageBuffer = await fetchStreetViewImage(
      location,
      apiKey,
      request.heading || 0,
      request.pitch || 0,
      request.fov || 90
    );
    
    // Save to S3
    const imageUrl = await saveImageToS3(request.property_id, imageBuffer);
    
    const response: StreetViewResponse = {
      property_id: request.property_id,
      image_url: imageUrl,
      cached: false,
      source: 'street_view'
    };
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    console.error('Street View fetch failed:', error);
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to fetch Street View image'
      })
    };
  }
}
