/**
 * @fileoverview Socrata API Routes
 * @description REST endpoints for CT Open Data Portal property search
 */

const express = require('express');
const { queryPropertiesFromSocrata, getDatasetMetadata } = require('../socrataService');

const router = express.Router();

/**
 * GET /socrata/properties
 * Query properties from CT Open Data Portal with filters
 */
router.get('/properties', async (req, res) => {
  try {
    const filters = {
      city: req.query.city || null,
      minPrice: req.query.minPrice ? parseInt(req.query.minPrice) : null,
      maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice) : null,
      propertyType: req.query.propertyType || null,
      residentialType: req.query.residentialType || null,
      limit: req.query.limit ? Math.min(parseInt(req.query.limit), 100) : 50,
      offset: req.query.page ? (parseInt(req.query.page) - 1) * (parseInt(req.query.limit) || 50) : 0,
    };

    console.log('[Socrata Route] Filters:', filters);

    const { properties, count } = await queryPropertiesFromSocrata(filters);

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = filters.limit || 50;
    const totalPages = Math.ceil(count / limit);

    res.json({
      data: properties,
      meta: {
        page,
        pageSize: limit,
        totalItems: count,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        city: filters.city,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        propertyType: filters.propertyType,
        residentialType: filters.residentialType,
      },
      source: 'CT Open Data Portal (Socrata)',
    });
  } catch (error) {
    console.error('[Socrata Route] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch properties',
      details: error.message,
    });
  }
});

/**
 * GET /socrata/metadata
 * Returns dataset metadata: cities, price ranges, property types
 * Used by AI chat to understand available data domains
 */
router.get('/metadata', async (req, res) => {
  try {
    const metadata = await getDatasetMetadata();

    res.json({
      ...metadata,
      description: 'CT Real Estate Sales 2020+ from CT Open Data Portal',
      source: 'https://data.ct.gov/resource/5mzw-sjtu',
    });
  } catch (error) {
    console.error('[Socrata Metadata] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch metadata',
      details: error.message,
    });
  }
});

/**
 * GET /socrata/cities
 * Returns list of all CT towns/cities
 */
router.get('/cities', async (req, res) => {
  try {
    const metadata = await getDatasetMetadata();
    res.json({ cities: metadata.cities });
  } catch (error) {
    console.error('[Socrata Cities] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch cities',
      details: error.message,
    });
  }
});

module.exports = router;
