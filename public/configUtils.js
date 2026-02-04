/**
 * @fileoverview Configuration and API utilities
 */

function getApiBase() {
  return window.HOME_HARBOR_CONFIG?.apiBaseUrl || '';
}

const localSample = Array.isArray(window.HOME_HARBOR_SAMPLE)
  ? window.HOME_HARBOR_SAMPLE
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