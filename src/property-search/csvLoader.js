/**
 * CSV Data Loader
 * 
 * Loads Connecticut real estate CSV data into Property entities
 * Uses streaming parser for memory efficiency with large files
 */

const fs = require('fs');
const { parse } = require('csv-parse');
const { Result } = require('./Property');
const { ctToProperty } = require('./ctDataMapper');

/**
 * Load CSV file and convert to Property entities
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Result>} Result containing Property array or error
 */
async function loadCsvFile(filePath) {
  return new Promise((resolve) => {
    const properties = [];
    const errors = [];

    // Check file exists
    if (!fs.existsSync(filePath)) {
      resolve(Result.fail(`CSV file not found: ${filePath}`));
      return;
    }

    const parser = parse({
      columns: true, // Use first row as column names
      skip_empty_lines: true,
      trim: true,
    });

    fs.createReadStream(filePath)
      .pipe(parser)
      .on('data', (row) => {
        const result = ctToProperty(row);
        if (result.isSuccess) {
          properties.push(result.value);
        } else {
          // Log error but continue processing
          errors.push({
            row,
            error: result.error,
          });
        }
      })
      .on('end', () => {
        if (properties.length === 0) {
          resolve(Result.fail('No valid properties loaded from CSV'));
        } else {
          resolve(Result.ok(properties));
        }
      })
      .on('error', (error) => {
        resolve(Result.fail(`CSV parsing error: ${error.message}`));
      });
  });
}

module.exports = { loadCsvFile };
