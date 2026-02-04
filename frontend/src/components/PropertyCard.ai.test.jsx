import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PropertyCard from './PropertyCard';

describe('PropertyCard - AI Analysis', () => {
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
});