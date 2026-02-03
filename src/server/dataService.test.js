const path = require('path');

process.env.DATA_FILE = path.join(
  __dirname,
  '..',
  '..',
  'data',
  'ct-sample.csv'
);

const { loadData, getHealth, queryProperties } = require('./dataService');

describe('dataService', () => {
  beforeAll(async () => {
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
