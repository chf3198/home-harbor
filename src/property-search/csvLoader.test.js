/**
 * CSV Data Loader Tests
 * Loads Connecticut real estate CSV data into Property entities
 * Uses neverthrow Result pattern
 */

const { loadCsvFile } = require('./csvLoader');
const path = require('path');

describe('csvLoader', () => {
  const samplePath = path.join(__dirname, '../../data/ct-sample-50.csv');

  describe('loadCsvFile', () => {
    it('should load CSV file and return array of Properties', async () => {
      const result = await loadCsvFile(samplePath);

      expect(result.isOk()).toBe(true);
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
      expect(result.value.length).toBeLessThanOrEqual(52);
    });

    it('should skip invalid rows and continue processing', async () => {
      const result = await loadCsvFile(samplePath);

      // Should succeed even if some rows fail validation
      expect(result.isOk()).toBe(true);
      expect(result.value.length).toBeGreaterThan(0);
    });

    it('should fail on non-existent file', async () => {
      const badPath = path.join(__dirname, '../../data/nonexistent.csv');
      const result = await loadCsvFile(badPath);

      expect(result.isErr()).toBe(true);
      expect(result.error).toContain('not found');
    });
  });
});
