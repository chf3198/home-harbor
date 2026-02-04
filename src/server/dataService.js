const path = require('path');
const { loadCsvFile, paginate } = require('../property-search');
const { applyFilters, parseNumber } = require('./queryService');

const DATA_FILE =
  process.env.DATA_FILE ||
  path.join(__dirname, '..', '..', 'data', 'ct-sample.csv');

let propertiesCache = [];
let cityCache = [];
let dataLoadError = null;

function assignIds(properties) {
  return properties.map((property, index) => {
    const serial = property.metadata?.serialNumber;
    property.id = serial || `fallback-${index + 1}`;
    return property;
  });
}

function buildCityCache(properties) {
  const unique = new Set();
  properties.forEach((property) => {
    if (property.city) {
      unique.add(property.city.trim());
    }
  });

  return Array.from(unique).sort((a, b) => a.localeCompare(b));
}

async function loadData() {
  const result = await loadCsvFile(DATA_FILE);
  if (result.isOk()) {
    propertiesCache = assignIds(result.value);
    cityCache = buildCityCache(propertiesCache);
    dataLoadError = null;
  } else {
    propertiesCache = [];
    cityCache = [];
    dataLoadError = result.error;
  }
}

function getHealth() {
  return {
    status: 'ok',
    dataFile: DATA_FILE,
    propertiesLoaded: propertiesCache.length,
    dataLoadError,
  };
}

function queryProperties(query) {
  if (dataLoadError) {
    const error = new Error(dataLoadError);
    error.code = 'DATA_LOAD_FAILED';
    throw error;
  }

  const filtered = applyFilters(propertiesCache, query);
  const page = parseNumber(query.page, 1);
  const pageSize = parseNumber(query.pageSize, 10);

  return paginate(filtered, { page, pageSize });
}

function getPropertyById(id) {
  return propertiesCache.find((property) => property.id === id) || null;
}

function getCities() {
  return cityCache;
}

module.exports = {
  loadData,
  getHealth,
  queryProperties,
  getPropertyById,
  getCities,
};
