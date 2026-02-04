import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PropertyCard from './PropertyCard';

describe('PropertyCard - Rendering', () => {
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

  it('renders Realtor.com search link with Google site search URL', () => {
    render(<PropertyCard {...defaultProps} />);

    const link = screen.getByRole('link', { name: /find on google.*realtor\.com/i });
    // Uses Google site search for more reliable property lookup
    expect(link).toHaveAttribute('href', 'https://www.google.com/search?q=site%3Arealtor.com%20123%20Main%20St%2C%20Hartford%2C%20CT%20Hartford%20CT');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});