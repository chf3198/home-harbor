/**
 * @fileoverview Mock API server for E2E testing
 * Provides realistic test data without external dependencies
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001; // Different port from main server

// Mock property data
const mockProperties = [
  {
    id: '1',
    address: '123 Main St, Hartford, CT',
    city: 'Hartford',
    state: 'CT',
    price: 285000,
    bedrooms: 3,
    bathrooms: 2,
    propertyType: 'Single Family',
    squareFeet: 1800,
    yearBuilt: 1995,
    description: 'Beautiful colonial home in quiet neighborhood',
    imageUrl: '/api/placeholder/400/300'
  },
  {
    id: '2',
    address: '456 Oak Ave, Hartford, CT',
    city: 'Hartford',
    state: 'CT',
    price: 325000,
    bedrooms: 4,
    bathrooms: 3,
    propertyType: 'Single Family',
    squareFeet: 2200,
    yearBuilt: 2005,
    description: 'Modern home with updated kitchen',
    imageUrl: '/api/placeholder/400/300'
  },
  {
    id: '3',
    address: '789 Elm Dr, West Hartford, CT',
    city: 'West Hartford',
    state: 'CT',
    price: 450000,
    bedrooms: 4,
    bathrooms: 3,
    propertyType: 'Single Family',
    squareFeet: 2800,
    yearBuilt: 2010,
    description: 'Luxury home in desirable area',
    imageUrl: '/api/placeholder/400/300'
  }
];

// Mock AI responses
const mockAIResponses = {
  'What neighborhoods in Hartford are good for families?': 'Based on the Hartford property data, several neighborhoods stand out for families: 1) West End - excellent schools and parks, 2) Asylum Hill - historic charm with modern amenities, 3) Blue Hills - suburban feel close to city center. Properties in these areas typically range from $250K-$500K for 3-4 bedroom homes.',
  'What are the best deals in Hartford?': 'Looking at current Hartford listings, the best value properties are in the $250K-$350K range. The 3-bedroom colonial at 123 Main St offers great bang for your buck with recent updates. Consider properties in up-and-coming neighborhoods for potential appreciation.',
  'default': 'I\'m here to help you find the perfect property in Connecticut! I can analyze market trends, compare neighborhoods, and provide insights on specific listings. What would you like to know?'
};

// API Routes
app.use(express.json());

// Properties search endpoint
app.get('/api/properties', (req, res) => {
  const { city, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

  let filtered = [...mockProperties];

  // Apply filters
  if (city) {
    filtered = filtered.filter(p => p.city.toLowerCase().includes(city.toLowerCase()));
  }

  if (minPrice) {
    filtered = filtered.filter(p => p.price >= parseInt(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter(p => p.price <= parseInt(maxPrice));
  }

  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginated = filtered.slice(startIndex, endIndex);

  res.json({
    properties: paginated,
    total: filtered.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(filtered.length / parseInt(limit))
  });
});

// AI chat endpoint
app.post('/api/ai/chat', (req, res) => {
  const { message } = req.body;

  // Simulate processing delay
  setTimeout(() => {
    const response = mockAIResponses[message] || mockAIResponses.default;
    res.json({
      response,
      timestamp: new Date().toISOString()
    });
  }, 1000); // 1 second delay to simulate AI processing
});

// AI property analysis endpoint
app.post('/api/ai/analyze', (req, res) => {
  const { propertyId } = req.body;

  const property = mockProperties.find(p => p.id === propertyId);

  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  // Simulate analysis delay
  setTimeout(() => {
    const analysis = {
      propertyId,
      marketValue: property.price,
      comps: `Comparable sales in ${property.city} range from $${property.price - 50000} to $${property.price + 50000}`,
      insights: `${property.bedrooms} bedroom, ${property.bathrooms} bathroom home built in ${property.yearBuilt}. ${property.squareFeet} sq ft. Good investment potential.`,
      recommendations: 'Consider scheduling a viewing. Property is priced competitively for the area.'
    };

    res.json(analysis);
  }, 1500); // 1.5 second delay
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Catch-all handler for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Mock API server running on http://localhost:${PORT}`);
  });
}

module.exports = app;