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
  const { message } = req.body || {};

  if (!message || message.trim() === '') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  try {
    const response = await askChat(message);

    if (!response.success) {
      res.status(502).json({
        error: response.error,
        errorType: response.errorType,
      });
      return;
    }

    res.json({
      message: response.message,
      model: response.model,
    });
  } catch (error) {
    res.status(503).json({
      error: 'Chat assistant unavailable',
      details: error.message,
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
