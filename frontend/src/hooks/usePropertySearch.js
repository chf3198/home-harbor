import { createContext, useContext, useReducer, useCallback } from 'react';

// Types
const PropertyActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_RESULTS: 'SET_RESULTS',
  SET_ERROR: 'SET_ERROR',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGE: 'SET_PAGE',
  CLEAR_RESULTS: 'CLEAR_RESULTS',
};

// Initial state
const initialState = {
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

// Reducer
function propertyReducer(state, action) {
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