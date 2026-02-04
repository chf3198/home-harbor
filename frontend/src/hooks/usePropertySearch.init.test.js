import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { PropertyProvider, usePropertySearch } from './usePropertySearch';

// Mock fetch globally
global.fetch = vi.fn();

describe('usePropertySearch - Initialization', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePropertySearch(), {
      wrapper: PropertyProvider,
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBe(null);
    expect(result.current.filters).toEqual({
      city: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      propertyType: '',
    });
    expect(result.current.pagination).toEqual({
      page: 1,
      pageSize: 12,
      total: 0,
      totalPages: 0,
    });
  });
});