/**
 * CSV Data Loader
 * 
 * Loads Connecticut real estate CSV data into Property entities
 * Uses streaming parser for memory efficiency with large files
 */

const fs = require('fs');
const { parse } = require('csv-parse');
const { err, ok } = require('neverthrow');
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
      resolve(err(`CSV file not found: ${filePath}`));
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
        if (result.isOk()) {
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
          resolve(err('No valid properties loaded from CSV'));
        } else {
          resolve(ok(properties));
        }
      })
      .on('error', (error) => {
        resolve(err(`CSV parsing error: ${error.message}`));
      });
  });
}

module.exports = { loadCsvFile };
