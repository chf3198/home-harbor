import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('AIChatSection - Interaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls clearChat when clear button is clicked', () => {
    render(<AIChatSection />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(mockClearChat).toHaveBeenCalled();
  });

  it('shows loading state during message sending', () => {
    // Mock loading state
    vi.mocked(vi.importActual('../hooks/useAIChat')).useAIChat.mockReturnValue({
      sendMessage: mockSendMessage,
      response: '',
      loading: true,
      error: null,
      clearChat: mockClearChat,
    });

    render(<AIChatSection />);

    expect(screen.getByText('Sending...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
  });

  it('shows placeholder message when no response', () => {
    // Mock no response state
    vi.mocked(vi.importActual('../hooks/useAIChat')).useAIChat.mockReturnValue({
      sendMessage: mockSendMessage,
      response: '',
      loading: false,
      error: null,
      clearChat: mockClearChat,
    });

    render(<AIChatSection />);

    expect(screen.getByText(/AI responses will appear here/)).toBeInTheDocument();
  });
});