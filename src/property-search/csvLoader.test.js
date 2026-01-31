/**
 * CSV Data Loader Tests (RED)
 * Loads Connecticut real estate CSV data into Property entities
 */

const { loadCsvFile } = require('./csvLoader');
const path = require('path');

describe('csvLoader', () => {
  const samplePath = path.join(__dirname, '../../data/ct-sample-50.csv');

  describe('loadCsvFile', () => {
    it('should load CSV file and return array of Properties', async () => {
      const result = await loadCsvFile(samplePath);

      expect(result.isSuccess).toBe(true);
      const properties = result.value;
      expect(Array.isArray(properties)).toBe(true);
      expect(properties.length).toBeGreaterThan(0);
      expect(properties[0].address).toBeDefined();
      expect(properties[0].city).toBeDefined();
      expect(properties[0].price).toBeGreaterThan(0);
    });

    it('should skip header row', async () => {
      const result = await loadCsvFile(samplePath);

      const properties = result.value;
      // First property should not be header values
      expect(properties[0].city).not.toBe('Town');
      expect(properties[0].address).not.toContain('Address');
    });

    it('should handle all sample records', async () => {
      const result = await loadCsvFile(samplePath);

      // CSV has 52 lines (1 header + 51 data rows)
      expect(result.value.length).toBeGreaterThanOrEqual(40); // Allow for some invalid rows
      expect(result.value.length).toBeLessThanOrEqual(51);
    });

    it('should skip invalid rows and continue processing', async () => {
      const result = await loadCsvFile(samplePath);

      // Should succeed even if some rows fail validation
      expect(result.isSuccess).toBe(true);
      expect(result.value.length).toBeGreaterThan(0);
    });

    it('should fail on non-existent file', async () => {
      const result = await loadCsvFile('/nonexistent/file.csv');

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('file');
    });

    it('should validate loaded properties have required CT fields', async () => {
      const result = await loadCsvFile(samplePath);

      const properties = result.value;
      const firstProp = properties[0];
      
      expect(firstProp.state).toBe('CT');
      expect(firstProp.metadata.propertyType).toBeDefined();
      expect(firstProp.metadata.saleDate).toBeDefined();
      expect(firstProp.metadata.assessedValue).toBeDefined();
    });
  });
});
