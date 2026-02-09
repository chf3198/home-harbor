const express = require('express');
const { getPropertyById } = require('../dataService');
const { askChat } = require('../chatService');
const { analyzeProperty } = require('../visionService');
const { generateDescription } = require('../descriptionService');
const {
  extractFiltersWithLLM,
  fallbackExtraction,
  generateResultsExplanation,
  CT_TOP_SCHOOL_TOWNS,
} = require('../filterExtractionService');

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
    // Step 1: Extract filters using LLM (with fallback to keyword matching)
    console.log('[AI Chat] Extracting filters from:', message);
    const filterResult = await extractFiltersWithLLM(message);
    console.log('[AI Chat] Filter extraction result:', filterResult);

    // Step 2: Get conversational response from chat assistant
    const chatResult = await askChat(message);

    if (!chatResult.success) {
      // Even if chat fails, still return filters for search
      res.json({
        response: `I'm having trouble connecting to my AI assistant, but I've started a search based on your request. ${generateResultsExplanation(filterResult.searchIntent, filterResult.suggestedTowns, filterResult.filters, 0)}`,
        model: null,
        filters: filterResult.filters,
        searchIntent: filterResult.searchIntent,
        suggestedTowns: filterResult.suggestedTowns,
        extractedBy: filterResult.extractedBy,
        alwaysSearch: true,
      });
      return;
    }

    // Step 3: Build enhanced response that acknowledges the search
    let responseText = chatResult.message;

    // Add search context to the response if not already mentioned
    if (filterResult.filters && filterResult.searchIntent) {
      const townInfo = filterResult.suggestedTowns.length > 0
        ? ` I'm showing you properties in ${filterResult.suggestedTowns.slice(0, 3).join(', ')}`
        : '';
      
      // Only add if the AI didn't already mention searching
      if (!responseText.toLowerCase().includes('search') && 
          !responseText.toLowerCase().includes('showing') &&
          !responseText.toLowerCase().includes('found')) {
        responseText += `\n\n🔍 *I've started a search for ${filterResult.searchIntent}.${townInfo} — check out the results below!*`;
      }
    }

    res.json({
      response: responseText,
      model: chatResult.model,
      filters: filterResult.filters, // ALWAYS return filters
      searchIntent: filterResult.searchIntent,
      suggestedTowns: filterResult.suggestedTowns,
      extractedBy: filterResult.extractedBy,
      alwaysSearch: true, // Signal to frontend to always trigger search
    });
  } catch (error) {
    console.error('[AI Chat] Error:', error);
    
    // Fallback: still extract filters and return them
    const fallback = fallbackExtraction(message);
    res.status(503).json({
      error: 'Chat assistant unavailable',
      details: error.message,
      filters: fallback.filters, // Still provide filters for search
      searchIntent: fallback.searchIntent,
      alwaysSearch: true,
    });
  }
});

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
