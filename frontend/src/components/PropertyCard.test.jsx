import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PropertyCard from './PropertyCard';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('PropertyCard', () => {
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

  it('renders property information correctly', () => {
    render(<PropertyCard {...defaultProps} />);

    expect(screen.getByText('123 Main St, Hartford, CT')).toBeInTheDocument();
    expect(screen.getByText('Price: $250,000')).toBeInTheDocument();
    expect(screen.getByText('City: Hartford | Type: Single Family')).toBeInTheDocument();
    expect(screen.getByText('Assessed: $240,000')).toBeInTheDocument();
  });

  it('renders Realtor.com link with correct URL', () => {
    render(<PropertyCard {...defaultProps} />);

    const link = screen.getByRole('link', { name: /view on realtor\.com/i });
    expect(link).toHaveAttribute('href', 'https://www.realtor.com/realestateandhomes-search/123%20Main%20St%2C%20Hartford%2C%20CT');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
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

  it('calls onAnalyze with correct type when AI buttons are clicked', () => {
    render(<PropertyCard {...defaultProps} />);

    const visionButton = screen.getByRole('button', { name: /analyze photo/i });
    const descriptionButton = screen.getByRole('button', { name: /generate description/i });

    fireEvent.click(visionButton);
    expect(defaultProps.onAnalyze).toHaveBeenCalledWith('vision');

    fireEvent.click(descriptionButton);
    expect(defaultProps.onAnalyze).toHaveBeenCalledWith('description');
  });

  it('disables AI buttons when analyzing', () => {
    render(<PropertyCard {...defaultProps} isAnalyzing={true} />);

    const visionButton = screen.getByRole('button', { name: /analyzing/i });
    const descriptionButton = screen.getByRole('button', { name: /generating/i });

    expect(visionButton).toBeDisabled();
    expect(descriptionButton).toBeDisabled();
  });

  it('displays AI response when provided', () => {
    render(<PropertyCard {...defaultProps} aiResponse="This is a beautiful home with great curb appeal." />);

    expect(screen.getByText('AI Analysis')).toBeInTheDocument();
    expect(screen.getByText('This is a beautiful home with great curb appeal.')).toBeInTheDocument();
  });

  it('displays AI error when provided', () => {
    render(<PropertyCard {...defaultProps} aiError="Analysis failed" />);

    expect(screen.getByText('Analysis failed')).toBeInTheDocument();
  });

  it('handles API error when loading details', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<PropertyCard {...defaultProps} isExpanded={true} />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});