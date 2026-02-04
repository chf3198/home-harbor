import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PropertyCard from './PropertyCard';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('PropertyCard - Expansion', () => {
  const mockProperty = {
    id: '123',
    address: '123 Main St, Hartford, CT',
    price: 250000,
    city: 'Hartford',
    metadata: {
      propertyType: 'Single Family',
      assessedValue: 240000,
    },
  };

  const defaultProps = {
    property: mockProperty,
    isExpanded: false,
    isAnalyzing: false,
    aiResponse: '',
    aiError: '',
    onToggleExpansion: vi.fn(),
    onAnalyze: vi.fn(),
    formatCurrency: vi.fn((value) => `$${value.toLocaleString()}`),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onToggleExpansion when view details button is clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockProperty, metadata: { ...mockProperty.metadata, saleDate: '2023-01-01' } }),
    });

    render(<PropertyCard {...defaultProps} />);

    const button = screen.getByRole('button', { name: /view details/i });
    fireEvent.click(button);

    expect(defaultProps.onToggleExpansion).toHaveBeenCalled();

    // Wait for details to load
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/properties/123');
    });
  });

  it('shows expanded details when isExpanded is true', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockProperty, metadata: { ...mockProperty.metadata, saleDate: '2023-01-01' } }),
    });

    render(<PropertyCard {...defaultProps} isExpanded={true} />);

    await waitFor(() => {
      expect(screen.getByText('Sale Date: 2023-01-01')).toBeInTheDocument();
    });
  });

  it('handles API error when loading details', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<PropertyCard {...defaultProps} isExpanded={true} />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});