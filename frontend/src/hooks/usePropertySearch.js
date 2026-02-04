/**
 * @fileoverview Property Search Hook and Provider
 */

import { createContext, useContext, useReducer, useCallback } from 'react';
import { PropertyActionTypes, initialState } from './propertySearchTypes.js';
import { propertyReducer } from './propertySearchReducer.js';

// Context
const PropertyContext = createContext();

// Provider component
export function PropertyProvider({ children }) {
  const [state, dispatch] = useReducer(propertyReducer, initialState);

  const searchProperties = useCallback(async (filters = {}, page = 1) => {
    dispatch({ type: PropertyActionTypes.SET_LOADING, payload: true });

    try {
      const queryParams = new URLSearchParams({
        ...filters,
        page: page.toString(),
        limit: '12',
      });

      const response = await fetch(`/api/properties?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      dispatch({ type: PropertyActionTypes.SET_RESULTS, payload: data });
    } catch (error) {
      dispatch({ type: PropertyActionTypes.SET_ERROR, payload: error.message });
    }
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: PropertyActionTypes.SET_FILTERS, payload: filters });
  }, []);

  const setPage = useCallback((page) => {
    dispatch({ type: PropertyActionTypes.SET_PAGE, payload: page });
  }, []);

  const clearResults = useCallback(() => {
    dispatch({ type: PropertyActionTypes.CLEAR_RESULTS });
  }, []);

  const value = {
    ...state,
    searchProperties,
    setFilters,
    setPage,
    clearResults,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

// Hook
export function usePropertySearch() {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('usePropertySearch must be used within a PropertyProvider');
  }
  return context;
}