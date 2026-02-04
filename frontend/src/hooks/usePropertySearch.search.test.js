import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { PropertyProvider, usePropertySearch } from './usePropertySearch';

// Mock fetch globally
global.fetch = vi.fn();

describe('usePropertySearch - Search', () => {
  beforeEach(() => {
    fetch.mockClear();
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
});