/**
 * @fileoverview Property Search Reducer
 */

import { PropertyActionTypes } from './propertySearchTypes.js';

// Reducer function
export function propertyReducer(state, action) {
  switch (action.type) {
    case PropertyActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case PropertyActionTypes.SET_RESULTS:
      return {
        ...state,
        results: action.payload.data,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
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