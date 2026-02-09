/**
 * @fileoverview LLM-based filter extraction service
 * @description Uses AI to extract search filters from natural language queries
 * @semantic ai, filters, search, extraction
 * @intent Always produce actionable search filters from any property-related query
 */

const ChatAssistant = require('../ai-assistant/chatAssistant');

/**
 * CT towns with notable high schools (for school-related queries)
 * Ranked roughly by school reputation/ratings
 */
const CT_TOP_SCHOOL_TOWNS = [
  'Darien', 'New Canaan', 'Westport', 'Wilton', 'Ridgefield',
  'Glastonbury', 'Simsbury', 'Avon', 'Farmington', 'Madison',
  'Guilford', 'Old Saybrook', 'Cheshire', 'Trumbull', 'Fairfield',
  'Greenwich', 'Weston', 'Easton', 'Monroe', 'Newtown'
];

/**
 * Map of search intent keywords to relevant CT towns
 */
const INTENT_TO_TOWNS = {
  'school': CT_TOP_SCHOOL_TOWNS,
  'high school': CT_TOP_SCHOOL_TOWNS,
  'education': CT_TOP_SCHOOL_TOWNS,
  'family': CT_TOP_SCHOOL_TOWNS.slice(0, 10),
  'kids': CT_TOP_SCHOOL_TOWNS.slice(0, 10),
  'children': CT_TOP_SCHOOL_TOWNS.slice(0, 10),
  'safe': ['Darien', 'New Canaan', 'Wilton', 'Ridgefield', 'Madison', 'Guilford'],
  'quiet': ['Madison', 'Guilford', 'Old Saybrook', 'Essex', 'Chester', 'Deep River'],
  'commute': ['Stamford', 'Norwalk', 'Greenwich', 'Darien', 'New Haven', 'Fairfield'],
  'city': ['Hartford', 'New Haven', 'Stamford', 'Bridgeport', 'Norwalk'],
  'affordable': ['Hartford', 'New Britain', 'Waterbury', 'Meriden', 'Bristol'],
  'luxury': ['Greenwich', 'Darien', 'New Canaan', 'Westport', 'Fairfield'],
};

/**
 * System prompt for filter extraction
 * Designed to ALWAYS return valid search filters
 */
const FILTER_EXTRACTION_PROMPT = `You are a search filter extraction assistant. Your ONLY job is to extract search parameters from user messages and return valid JSON.

CRITICAL RULES:
1. ALWAYS return a JSON object with search filters - never refuse
2. If the user mentions ANY property-related concept, extract filters
3. Use reasonable defaults when specifics aren't provided
4. For school-related queries, use top CT school towns: Darien, New Canaan, Westport, Glastonbury, Simsbury

OUTPUT FORMAT (JSON only, no explanation):
{
  "city": "CityName or null",
  "minPrice": number or null,
  "maxPrice": number or null,
  "propertyType": "Residential" or "Commercial" or null,
  "residentialType": "Single Family" or "Two Family" or "Condo" or null,
  "searchIntent": "brief description of what user is looking for",
  "suggestedTowns": ["Town1", "Town2"] // if multiple towns match the intent
}

EXAMPLES:

User: "I want a house in Hartford under 300k"
{"city": "Hartford", "minPrice": null, "maxPrice": 300000, "propertyType": "Residential", "residentialType": "Single Family", "searchIntent": "affordable single family home in Hartford", "suggestedTowns": ["Hartford"]}

User: "Best schools for my kids"
{"city": "Darien", "minPrice": 500000, "maxPrice": 2000000, "propertyType": "Residential", "residentialType": "Single Family", "searchIntent": "family home near top-rated schools", "suggestedTowns": ["Darien", "New Canaan", "Westport", "Glastonbury", "Simsbury"]}

User: "Moving from out of state with high school boys"
{"city": "Glastonbury", "minPrice": 400000, "maxPrice": 1500000, "propertyType": "Residential", "residentialType": "Single Family", "searchIntent": "family home in top CT high school district", "suggestedTowns": ["Darien", "New Canaan", "Westport", "Glastonbury", "Wilton"]}

User: "Something affordable near NYC"
{"city": "Stamford", "minPrice": 200000, "maxPrice": 500000, "propertyType": "Residential", "residentialType": null, "searchIntent": "affordable home with NYC commute", "suggestedTowns": ["Stamford", "Norwalk", "Bridgeport", "New Haven"]}

User: "Just browsing"
{"city": null, "minPrice": 200000, "maxPrice": 600000, "propertyType": "Residential", "residentialType": null, "searchIntent": "general property browsing", "suggestedTowns": ["Hartford", "New Haven", "Stamford"]}

Now extract filters from the following message. Return ONLY valid JSON, no other text:`;

/**
 * Extract filters using LLM
 * @param {string} message - User's natural language message
 * @returns {Promise<Object>} Extracted filters with metadata
 */
async function extractFiltersWithLLM(message) {
  try {
    const assistant = new ChatAssistant();
    assistant.setSystemPrompt(FILTER_EXTRACTION_PROMPT);

    const result = await assistant.askOneOff(message);

    if (!result.success) {
      console.error('[FilterExtraction] LLM failed:', result.error);
      return fallbackExtraction(message);
    }

    // Parse JSON from response
    const jsonMatch = result.message.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('[FilterExtraction] No JSON in LLM response, using fallback');
      return fallbackExtraction(message);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Ensure we have at least basic filters
    const filters = {
      city: parsed.city || null,
      minPrice: parsed.minPrice || 100000,
      maxPrice: parsed.maxPrice || 1000000,
      propertyType: parsed.propertyType || 'Residential',
      residentialType: parsed.residentialType || null,
    };

    return {
      filters,
      searchIntent: parsed.searchIntent || 'property search',
      suggestedTowns: parsed.suggestedTowns || [],
      extractedBy: 'llm',
      model: result.model,
    };
  } catch (error) {
    console.error('[FilterExtraction] Error:', error.message);
    return fallbackExtraction(message);
  }
}

/**
 * Fallback extraction using keyword matching
 * @param {string} message - User message
 * @returns {Object} Extracted filters with defaults
 */
function fallbackExtraction(message) {
  const lowerMsg = message.toLowerCase();
  const filters = {
    city: null,
    minPrice: 100000,
    maxPrice: 800000,
    propertyType: 'Residential',
    residentialType: null,
  };
  let searchIntent = 'general property search';
  let suggestedTowns = ['Hartford', 'New Haven', 'Stamford'];

  // Check for school-related keywords
  if (/school|education|kids|children|family|teen|high\s*school/i.test(lowerMsg)) {
    filters.city = 'Glastonbury'; // Good default for families
    filters.minPrice = 350000;
    filters.maxPrice = 1200000;
    filters.residentialType = 'Single Family';
    searchIntent = 'family home near quality schools';
    suggestedTowns = CT_TOP_SCHOOL_TOWNS.slice(0, 5);
  }

  // Check for intent keywords and map to towns
  for (const [keyword, towns] of Object.entries(INTENT_TO_TOWNS)) {
    if (lowerMsg.includes(keyword)) {
      filters.city = filters.city || towns[0];
      suggestedTowns = towns.slice(0, 5);
      searchIntent = `properties matching "${keyword}" criteria`;
      break;
    }
  }

  // Extract explicit price mentions
  const priceMatch = lowerMsg.match(/(?:under|below|max|up\s*to)\s*\$?([\d,]+)\s*k?/i);
  if (priceMatch) {
    let price = parseInt(priceMatch[1].replace(/,/g, ''), 10);
    if (price < 10000) price *= 1000; // Handle "300k"
    filters.maxPrice = price;
  }

  const minPriceMatch = lowerMsg.match(/(?:over|above|min|at\s*least)\s*\$?([\d,]+)\s*k?/i);
  if (minPriceMatch) {
    let price = parseInt(minPriceMatch[1].replace(/,/g, ''), 10);
    if (price < 10000) price *= 1000;
    filters.minPrice = price;
  }

  // Extract explicit city mentions
  const ctCities = [
    'hartford', 'stamford', 'new haven', 'bridgeport', 'waterbury',
    'norwalk', 'danbury', 'new britain', 'bristol', 'meriden',
    'west hartford', 'greenwich', 'fairfield', 'hamden', 'manchester',
    'darien', 'westport', 'new canaan', 'glastonbury', 'simsbury',
    'avon', 'farmington', 'madison', 'guilford', 'trumbull'
  ];

  for (const city of ctCities) {
    if (lowerMsg.includes(city)) {
      filters.city = city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }

  return {
    filters,
    searchIntent,
    suggestedTowns,
    extractedBy: 'fallback',
    model: null,
  };
}

/**
 * Generate explanation for search results based on intent
 * @param {string} searchIntent - What the user was looking for
 * @param {Array} suggestedTowns - Towns matching the criteria
 * @param {Object} filters - Applied filters
 * @param {number} resultCount - Number of results found
 * @returns {string} Human-friendly explanation
 */
function generateResultsExplanation(searchIntent, suggestedTowns, filters, resultCount) {
  const townList = suggestedTowns.slice(0, 3).join(', ');
  const priceRange = `$${(filters.minPrice || 0).toLocaleString()} - $${(filters.maxPrice || 0).toLocaleString()}`;

  if (resultCount === 0) {
    return `I searched for ${searchIntent} but didn't find exact matches. Try expanding your price range or exploring nearby towns like ${townList}.`;
  }

  let explanation = `Here are ${resultCount} properties matching your search for ${searchIntent}. `;

  if (filters.city) {
    explanation += `I focused on ${filters.city} `;
  } else if (suggestedTowns.length > 0) {
    explanation += `I searched in top areas like ${townList} `;
  }

  explanation += `within the ${priceRange} range. `;

  // Add context-specific tips
  if (searchIntent.includes('school')) {
    explanation += `These towns are known for excellent public schools. Would you like me to focus on a specific town or adjust the price range?`;
  } else if (searchIntent.includes('commute')) {
    explanation += `These areas offer good transit options to NYC. Want me to narrow down by commute time?`;
  } else {
    explanation += `Let me know if you'd like to refine the search!`;
  }

  return explanation;
}

module.exports = {
  extractFiltersWithLLM,
  fallbackExtraction,
  generateResultsExplanation,
  CT_TOP_SCHOOL_TOWNS,
  INTENT_TO_TOWNS,
};
