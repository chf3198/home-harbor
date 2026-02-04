import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { PropertyProvider, usePropertySearch } from './usePropertySearch';

// Mock fetch globally
global.fetch = vi.fn();

describe('usePropertySearch - Filters and Pagination', () => {
  beforeEach(() => {
    fetch.mockClear();
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