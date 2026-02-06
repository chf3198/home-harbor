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
      // Handle both { data, pagination } and { data, totalItems, ... } formats
      const payload = action.payload;
      const results = payload.data || [];
      const pagination = payload.pagination || {
        page: payload.page || 1,
        pageSize: payload.pageSize || 12,
        total: payload.totalItems || results.length,
        totalPages: payload.totalPages || 1,
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