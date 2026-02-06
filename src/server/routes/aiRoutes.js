const express = require('express');
const { getPropertyById } = require('../dataService');
const { askChat } = require('../chatService');
const { analyzeProperty } = require('../visionService');
const { generateDescription } = require('../descriptionService');

const router = express.Router();

router.get('/config', (req, res) => {
  const missingKeys = [];
  if (!process.env.OPENROUTER_API_KEY) missingKeys.push('OPENROUTER_API_KEY');
  if (!process.env.GOOGLE_MAPS_API_KEY) missingKeys.push('GOOGLE_MAPS_API_KEY');

  res.json({
    aiReady: missingKeys.length === 0,
    missingKeys,
  });
});

router.post('/chat', async (req, res) => {
  const { message, chatHistory, searchResults } = req.body || {};

  if (!message || message.trim() === '') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  try {
    const result = await askChat(message);

    if (!result.success) {
      res.status(502).json({
        error: result.error,
        errorType: result.errorType,
      });
      return;
    }

    // Extract filters from the message using simple pattern matching
    const { filters, extractedFields, defaultFields } = extractFiltersFromMessage(message);
    
    // Build response with defaults info if applicable
    let responseText = result.message;
    if (defaultFields.length > 0 && extractedFields.length > 0) {
      responseText += `\n\n📋 *I've applied some default search values: ${defaultFields.join(', ')}. Feel free to tell me if you'd like different values!*`;
    }

    res.json({
      response: responseText,
      model: result.model,
      filters: extractedFields.length > 0 ? filters : null,
      extractedFields,
      defaultFields,
    });
  } catch (error) {
    res.status(503).json({
      error: 'Chat assistant unavailable',
      details: error.message,
    });
  }
});

/**
 * Extract property search filters from natural language message
 * Returns filters with defaults applied for search
 */
function extractFiltersFromMessage(message) {
  const filters = {};
  const extractedFields = [];
  const defaultFields = [];
  const lowerMsg = message.toLowerCase();

  // Extract bedrooms
  const bedroomMatch = lowerMsg.match(/(\d+)\s*(?:bed(?:room)?s?|br|bd)/);
  if (bedroomMatch) {
    filters.bedrooms = parseInt(bedroomMatch[1], 10);
    extractedFields.push('bedrooms');
  }

  // Extract bathrooms
  const bathroomMatch = lowerMsg.match(/(\d+)\s*(?:bath(?:room)?s?|ba)/);
  if (bathroomMatch) {
    filters.bathrooms = parseInt(bathroomMatch[1], 10);
    extractedFields.push('bathrooms');
  }

  // Extract max price
  const priceMatch = lowerMsg.match(/(?:under|below|less than|max|maximum|up to)\s*\$?([\d,]+)k?/i);
  if (priceMatch) {
    let price = parseInt(priceMatch[1].replace(/,/g, ''), 10);
    if (lowerMsg.includes('k') || price < 1000) {
      price *= 1000;
    }
    filters.maxPrice = price;
    extractedFields.push('maxPrice');
  }

  // Extract city - check for common CT cities
  const ctCities = ['hartford', 'stamford', 'new haven', 'bridgeport', 'waterbury', 
                    'norwalk', 'danbury', 'new britain', 'bristol', 'meriden',
                    'west hartford', 'greenwich', 'fairfield', 'hamden', 'manchester'];
  for (const city of ctCities) {
    if (lowerMsg.includes(city)) {
      filters.city = city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      extractedFields.push('city');
      break;
    }
  }

  // Apply defaults for missing critical fields
  if (!filters.minPrice) {
    filters.minPrice = 100000;
    defaultFields.push('minPrice ($100,000)');
  }
  if (!filters.maxPrice) {
    filters.maxPrice = 500000;
    defaultFields.push('maxPrice ($500,000)');
  }

  return { filters, extractedFields, defaultFields };
}

router.post('/vision', async (req, res) => {
  const { propertyId, address } = req.body || {};
  const property = propertyId ? getPropertyById(propertyId) : null;
  const resolvedAddress = address || property?.address;

  if (!resolvedAddress) {
    res.status(400).json({ error: 'Address or propertyId is required' });
    return;
  }

  try {
    const result = await analyzeProperty(resolvedAddress);
    res.json(result);
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
});

router.post('/describe', async (req, res) => {
  const { propertyId } = req.body || {};
  const property = propertyId ? getPropertyById(propertyId) : null;

  if (!property) {
    res.status(400).json({ error: 'propertyId is required' });
    return;
  }

  try {
    const result = await generateDescription(property);
    res.json(result);
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
});

module.exports = router;
