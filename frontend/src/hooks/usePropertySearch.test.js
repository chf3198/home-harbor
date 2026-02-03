import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { PropertyProvider, usePropertySearch } from './usePropertySearch';

// Mock fetch globally
global.fetch = vi.fn();

describe('usePropertySearch', () => {
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

  it('should search properties successfully', async () => {
    const mockData = {
      data: [
        {
          id: '1',
          address: '123 Main St',
          price: 300000,
          bedrooms: 3,
          bathrooms: 2,
        },
      ],
      pagination: {
        page: 1,
        pageSize: 12,
        total: 1,
        totalPages: 1,
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() => usePropertySearch(), {
      wrapper: PropertyProvider,
    });

    await act(async () => {
      await result.current.searchProperties();
    });

    expect(fetch).toHaveBeenCalledWith('/api/properties?page=1&limit=12');
    expect(result.current.loading).toBe(false);
    expect(result.current.results).toEqual(mockData.data);
    expect(result.current.pagination).toEqual(mockData.pagination);
    expect(result.current.error).toBe(null);
  });

  it('should handle search error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    });

    const { result } = renderHook(() => usePropertySearch(), {
      wrapper: PropertyProvider,
    });

    await act(async () => {
      await result.current.searchProperties();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Search failed: Internal Server Error');
    expect(result.current.results).toEqual([]);
  });

  it('should update filters', () => {
    const { result } = renderHook(() => usePropertySearch(), {
      wrapper: PropertyProvider,
    });

    act(() => {
      result.current.setFilters({ city: 'Hartford', minPrice: '200000' });
    });

    expect(result.current.filters.city).toBe('Hartford');
    expect(result.current.filters.minPrice).toBe('200000');
  });

  it('should update page', () => {
    const { result } = renderHook(() => usePropertySearch(), {
      wrapper: PropertyProvider,
    });

    act(() => {
      result.current.setPage(2);
    });

    expect(result.current.pagination.page).toBe(2);
  });

  it('should clear results', () => {
    const { result } = renderHook(() => usePropertySearch(), {
      wrapper: PropertyProvider,
    });

    // First set some state
    act(() => {
      result.current.setFilters({ city: 'Hartford' });
      result.current.setPage(2);
    });

    act(() => {
      result.current.clearResults();
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.pagination.page).toBe(1);
    expect(result.current.pagination.total).toBe(0);
    expect(result.current.pagination.totalPages).toBe(0);
  });
});