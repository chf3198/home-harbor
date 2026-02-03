const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const DESCRIPTION_MODEL =
  process.env.OPENROUTER_DESCRIPTION_MODEL || 'meta-llama/llama-3.3-70b-instruct';

function getApiKey() {
  const value = process.env.OPENROUTER_API_KEY;
  if (!value) {
    throw new Error('OPENROUTER_API_KEY environment variable is required');
  }
  return value;
}

async function generateDescription(property) {
  const openRouterKey = getApiKey();

  const prompt = `Create a JSON response with: headline, summary, highlights (array), market_position, neighborhood_context, full_description. Use the following property data:\n${JSON.stringify(property)}`;

  const body = {
    model: DESCRIPTION_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1200,
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
  const description = JSON.parse(content);

  return { description, model: DESCRIPTION_MODEL };
}

module.exports = { generateDescription };
