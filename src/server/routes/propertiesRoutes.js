const express = require('express');
const { queryProperties, getPropertyById, getCities } = require('../dataService');

const router = express.Router();

router.get('/properties', (req, res) => {
  try {
    const result = queryProperties(req.query);
    res.json({
      ...result,
      filters: {
        city: req.query.city || null,
        propertyType: req.query.propertyType || null,
        residentialType: req.query.residentialType || null,
        minPrice: req.query.minPrice || null,
        maxPrice: req.query.maxPrice || null,
        sortBy: req.query.sortBy || null,
        sortOrder: req.query.sortOrder || 'asc',
      },
    });
  } catch (error) {
    if (error.code === 'DATA_LOAD_FAILED') {
      res.status(500).json({
        error: 'Data load failed',
        details: error.message,
      });
      return;
    }

    res.status(400).json({
      error: 'Invalid query parameters',
      details: error.message,
    });
  }
});

router.get('/properties/:id', (req, res) => {
  const property = getPropertyById(req.params.id);
  if (!property) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  res.json(property);
});

router.get('/cities', (req, res) => {
  res.json({ cities: getCities() });
});

module.exports = router;
