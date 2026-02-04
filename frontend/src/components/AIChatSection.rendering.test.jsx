import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AIChatSection from './AIChatSection';

// Mock the useAIChat hook
const mockSendMessage = vi.fn();
const mockClearChat = vi.fn();

vi.mock('../hooks/useAIChat', () => ({
  useAIChat: () => ({
    sendMessage: mockSendMessage,
    response: 'This is a test response',
    loading: false,
    error: null,
    clearChat: mockClearChat,
  }),
}));

describe('AIChatSection - Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the chat section with correct heading', () => {
    render(<AIChatSection />);

    expect(screen.getByText('Ask HomeHarbor')).toBeInTheDocument();
    expect(screen.getByText('AI assistance using OpenRouter.')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('renders the chat form with textarea and button', () => {
    render(<AIChatSection />);

    expect(screen.getByRole('textbox', { name: /your message/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('shows placeholder text in textarea', () => {
    render(<AIChatSection />);

    const textarea = screen.getByRole('textbox', { name: /your message/i });
    expect(textarea).toHaveAttribute('placeholder', 'Ask about the market or search tips...');
  });

  it('displays AI response when available', () => {
    render(<AIChatSection />);

    expect(screen.getByText('This is a test response')).toBeInTheDocument();
  });

  it('shows clear button when there is a response', () => {
    render(<AIChatSection />);

    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<AIChatSection />);

    const textarea = screen.getByRole('textbox', { name: /your message/i });
    expect(textarea).toHaveAttribute('aria-describedby');
  });
});