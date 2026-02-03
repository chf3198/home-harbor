import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';

// Mock window.dispatchEvent
const mockDispatchEvent = vi.fn();
Object.defineProperty(window, 'dispatchEvent', {
  writable: true,
  value: mockDispatchEvent,
});

describe('Header', () => {
  it('renders the HomeHarbor title and description', () => {
    render(<Header />);

    expect(screen.getByText('HomeHarbor')).toBeInTheDocument();
    expect(screen.getByText('AI-Powered Real Estate Search')).toBeInTheDocument();
    expect(screen.getByText(/Beautiful, compliant real estate search/)).toBeInTheDocument();
  });

  it('renders the help button with correct text', () => {
    render(<Header />);

    const helpButton = screen.getByRole('button', { name: /help & guides/i });
    expect(helpButton).toBeInTheDocument();
  });

  it('dispatches openHelp event when help button is clicked', () => {
    render(<Header />);

    const helpButton = screen.getByRole('button', { name: /help & guides/i });
    fireEvent.click(helpButton);

    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'openHelp',
        detail: 'user',
      })
    );
  });

  it('has proper accessibility attributes', () => {
    render(<Header />);

    const helpButton = screen.getByRole('button', { name: /help & guides/i });
    expect(helpButton).toHaveAttribute('aria-label', 'Open help and guides');
  });
});