const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const VISION_MODEL =
  process.env.OPENROUTER_VISION_MODEL || 'allenai/molmo-72b-0924';

function buildStreetViewUrl(address, apiKey) {
  const params = new URLSearchParams({
    size: '640x480',
    location: address,
    key: apiKey,
    fov: '90',
    heading: '0',
    pitch: '0',
    source: 'outdoor',
  });

  return `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;
}

function getApiKey(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

async function analyzeProperty(address) {
  const googleKey = getApiKey('GOOGLE_MAPS_API_KEY');
  const openRouterKey = getApiKey('OPENROUTER_API_KEY');
  const imageUrl = buildStreetViewUrl(address, googleKey);

  const prompt = `Analyze this residential property photo and return JSON with keys: architectural_style, exterior_condition (1-10), visible_features (array), curb_appeal_score (1-10), maintenance_level (Low|Medium|High), notable_highlights (array), potential_concerns (array).`;

  const body = {
    model: VISION_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
    temperature: 0.4,
    max_tokens: 800,
    response_format: { type: 'json_object' },
  };

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openRouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
      'X-Title': process.env.APP_NAME || 'HomeHarbor',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '{}';
  const insights = JSON.parse(content);

  return { imageUrl, insights, model: VISION_MODEL };
}

module.exports = { analyzeProperty };