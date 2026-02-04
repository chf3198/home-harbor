/**
 * @fileoverview Search and filtering utilities
 */

import { localSample, usesLocalData } from './configUtils.js';

function matchesText(value, query) {
  if (!query) return true;
  if (!value) return false;
  return value.toLowerCase().includes(query.toLowerCase());
}

function applyLocalFilters(properties, query) {
  return properties.filter((property) => {
    if (query.city && !matchesText(property.city, query.city)) {
      return false;
    }

    if (query.minPrice && Number(property.price) < Number(query.minPrice)) {
      return false;
    }

    if (query.maxPrice && Number(property.price) > Number(query.maxPrice)) {
      return false;
    }

    if (
      query.propertyType &&
      !matchesText(property.metadata?.propertyType, query.propertyType)
    ) {
      return false;
    }

    if (
      query.residentialType &&
      !matchesText(property.metadata?.residentialType, query.residentialType)
    ) {
      return false;
    }

    return true;
  });
}

function sortLocalResults(items, sortBy, sortOrder) {
  if (!sortBy) return items;
  const direction = sortOrder === 'desc' ? -1 : 1;

  return [...items].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'assessedValue') {
      aValue = a.metadata?.assessedValue;
      bValue = b.metadata?.assessedValue;
    }

    if (sortBy === 'saleDate') {
      aValue = a.metadata?.saleDate ? new Date(a.metadata.saleDate).getTime() : 0;
      bValue = b.metadata?.saleDate ? new Date(b.metadata.saleDate).getTime() : 0;
    }

    if (sortBy === 'city') {
      aValue = a.city || '';
      bValue = b.city || '';
    }

    if (typeof aValue === 'string') {
      return aValue.localeCompare(String(bValue)) * direction;
    }

    return (Number(aValue) - Number(bValue)) * direction;
  });
}

function buildLocalResponse(query, page, pageSize) {
  const filtered = applyLocalFilters(localSample, query);
  const sorted = sortLocalResults(filtered, query.sortBy, query.sortOrder);
  const size = pageSize > 0 ? pageSize : 10;
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * size;
  const data = sorted.slice(startIndex, startIndex + size);

  return {
    data,
    page: safePage,
    totalPages,
    totalItems,
    hasPrevPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  };
}

export { matchesText, applyLocalFilters, sortLocalResults, buildLocalResponse };