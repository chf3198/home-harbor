/**
 * @fileoverview Property Search Types and Constants
 */

// Action types
export const PropertyActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_RESULTS: 'SET_RESULTS',
  APPEND_RESULTS: 'APPEND_RESULTS',
  SET_ERROR: 'SET_ERROR',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGE: 'SET_PAGE',
  CLEAR_RESULTS: 'CLEAR_RESULTS',
};

// Initial state
export const initialState = {
  loading: false,
  results: [],
  error: null,
  filters: {
    city: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    propertyType: '',
  },
  pagination: {
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
  },
};