/**
 * @fileoverview Configuration and API utilities
 */

function getApiBase() {
  return window.HOME_HARBOR_CONFIG?.apiBaseUrl || '';
}

// Use HOME_HARBOR_DATA from index.html inline script
const localSample = Array.isArray(window.HOME_HARBOR_DATA)
  ? window.HOME_HARBOR_DATA
  : [];
const localDataById = new Map(
  localSample.map((property) => [String(property.id), property])
);

function usesLocalData() {
  return !getApiBase() && localSample.length > 0;
}

function isApiEnabled() {
  return Boolean(getApiBase());
}

function normalizeCity(value) {
  if (!value) return '';
  return value.toLowerCase().trim();
}

export { getApiBase, localSample, localDataById, usesLocalData, isApiEnabled, normalizeCity };