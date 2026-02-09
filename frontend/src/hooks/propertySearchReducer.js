/**
 * @fileoverview Property Search Reducer
 */

import { PropertyActionTypes } from './propertySearchTypes.js';

// Reducer function
export function propertyReducer(state, action) {
  switch (action.type) {
    case PropertyActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case PropertyActionTypes.SET_RESULTS: {
      // Handle { data, meta } format from Socrata API
      const payload = action.payload;
      const results = payload.data || [];
      const meta = payload.meta || {};
      const pagination = payload.pagination || {
        page: meta.page || payload.page || 1,
        pageSize: meta.pageSize || payload.pageSize || 12,
        total: meta.totalItems || payload.totalItems || results.length,
        totalPages: meta.totalPages || payload.totalPages || 1,
      };
      return {
        ...state,
        results,
        pagination,
        loading: false,
        error: null,
      };
    }
    case PropertyActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case PropertyActionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case PropertyActionTypes.SET_PAGE:
      return { ...state, pagination: { ...state.pagination, page: action.payload } };
    case PropertyActionTypes.CLEAR_RESULTS:
      return { ...state, results: [], pagination: { ...state.pagination, page: 1, total: 0, totalPages: 0 } };
    default:
      return state;
  }
}