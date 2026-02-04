const path = require('path');

describe('dataService', () => {
  let loadData, getHealth, queryProperties;

  beforeAll(async () => {
    // Set env before requiring module to ensure DATA_FILE is picked up
    process.env.DATA_FILE = path.join(
      __dirname,
      '..',
      '..',
      'data',
      'ct-sample-50.csv'
    );
    
    // Fresh require to pick up env var
    jest.resetModules();
    const dataService = require('./dataService');
    loadData = dataService.loadData;
    getHealth = dataService.getHealth;
    queryProperties = dataService.queryProperties;
    
    await loadData();
  });

  test('health reports loaded properties', () => {
    const health = getHealth();
    expect(health.status).toBe('ok');
    expect(health.propertiesLoaded).toBeGreaterThan(0);
  });

  test('queryProperties paginates results', () => {
    const result = queryProperties({ page: 1, pageSize: 5 });
    expect(result.data).toHaveLength(5);
    expect(result.totalItems).toBeGreaterThan(0);
  });
});
