/**
 * @fileoverview Property Search Hook and Provider
 * 
 * Persistence: Filters and results are saved to localStorage for:
 * - Page refresh recovery
 * - Session continuity
 */

import { createContext, useContext, useReducer, useCallback } from 'react';
import { PropertyActionTypes, initialState } from './propertySearchTypes.js';
import { propertyReducer } from './propertySearchReducer.js';
import { saveFilters, loadFilters, saveResults, loadResults } from './aiSearchStorage.js';

/**
 * Get initial state with persisted data from localStorage
 * This runs synchronously before first render to ensure UI consistency
 */
function getInitialState() {
  const savedFilters = loadFilters();
  const savedResults = loadResults();
  
  console.log('[usePropertySearch] Initializing from storage:', { 
    savedFilters, 
    savedResultsCount: savedResults?.length 
  });

  return {
    ...initialState,
    filters: savedFilters && Object.keys(savedFilters).length > 0 
      ? { ...initialState.filters, ...savedFilters }
      : initialState.filters,
    results: savedResults || [],
    pagination: savedResults?.length > 0 
      ? { ...initialState.pagination, total: savedResults.length, totalPages: Math.ceil(savedResults.length / 12) }
      : initialState.pagination,
  };
}

/**
 * Properties API URL configuration
 * - Production: AWS Lambda via API Gateway (Socrata-backed)
 * - Development: Vite proxy to local Express backend (Socrata-backed)
 * 
 * Both use CT Open Data Portal (211K+ properties) via Socrata API
 */
/* global __AWS_API_URL__ */
const AWS_PROPERTIES_API = `${typeof __AWS_API_URL__ !== 'undefined' ? __AWS_API_URL__ : ''}/properties`;
const LOCAL_PROPERTIES_API = '/api/socrata/properties';

function getPropertiesApiUrl() {
  const isProduction = import.meta.env.PROD;
  return isProduction ? AWS_PROPERTIES_API : LOCAL_PROPERTIES_API;
}

// Context
const PropertyContext = createContext();

// Provider component
export function PropertyProvider({ children }) {
  // Initialize state synchronously from localStorage
  // This ensures persisted results are available on first render (toggle visible immediately)
  const [state, dispatch] = useReducer(propertyReducer, null, getInitialState);

  const searchProperties = useCallback(async (filters = {}, page = 1) => {
    console.log('[usePropertySearch] searchProperties called with:', filters);
    dispatch({ type: PropertyActionTypes.SET_LOADING, payload: true });

    try {
      // Clean filters - remove null/undefined values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v != null && v !== '')
      );
      console.log('[usePropertySearch] Clean filters:', cleanFilters);

      const queryParams = new URLSearchParams({
        ...cleanFilters,
        page: page.toString(),
        limit: '12',
      });

      const apiUrl = getPropertiesApiUrl();
      console.log('[usePropertySearch] Fetching from:', `${apiUrl}?${queryParams}`);
      const response = await fetch(`${apiUrl}?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[usePropertySearch] Response data:', data);
      dispatch({ type: PropertyActionTypes.SET_RESULTS, payload: data });
      
      // Save results to localStorage for page refresh recovery
      // Handle both API formats: { data: [...] } (Socrata) and { properties: [...] } (Lambda)
      const resultsToSave = data.data || data.properties;
      if (resultsToSave && resultsToSave.length > 0) {
        saveResults(resultsToSave);
      }
    } catch (error) {
      console.error('[usePropertySearch] Error:', error);
      dispatch({ type: PropertyActionTypes.SET_ERROR, payload: error.message });
    }
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: PropertyActionTypes.SET_FILTERS, payload: filters });
    // Save filters to localStorage for page refresh recovery
    saveFilters(filters);
  }, []);

  const setPage = useCallback((page) => {
    dispatch({ type: PropertyActionTypes.SET_PAGE, payload: page });
  }, []);

  const clearResults = useCallback(() => {
    dispatch({ type: PropertyActionTypes.CLEAR_RESULTS });
    // Clear saved results from localStorage
    saveResults([]);
    saveFilters({});
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