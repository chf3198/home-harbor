import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('AIChatSection', () => {
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

  it('calls sendMessage when form is submitted with valid message', async () => {
    render(<AIChatSection />);

    const textarea = screen.getByRole('textbox', { name: /your message/i });
    const submitButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(textarea, { target: { value: 'What is the market like?' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('What is the market like?');
    });
  });

  it('clears textarea after successful submission', async () => {
    render(<AIChatSection />);

    const textarea = screen.getByRole('textbox', { name: /your message/i });
    const submitButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(textarea, { target: { value: 'Test message' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(textarea.value).toBe('');
    });
  });

  it('does not submit empty message', () => {
    render(<AIChatSection />);

    const submitButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(submitButton);

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('does not submit whitespace-only message', () => {
    render(<AIChatSection />);

    const textarea = screen.getByRole('textbox', { name: /your message/i });
    const submitButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(textarea, { target: { value: '   ' } });
    fireEvent.click(submitButton);

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('displays AI response when available', () => {
    render(<AIChatSection />);

    expect(screen.getByText('This is a test response')).toBeInTheDocument();
  });

  it('shows clear button when there is a response', () => {
    render(<AIChatSection />);

    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('calls clearChat when clear button is clicked', () => {
    render(<AIChatSection />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(mockClearChat).toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    render(<AIChatSection />);

    const textarea = screen.getByRole('textbox', { name: /your message/i });
    expect(textarea).toHaveAttribute('aria-describedby');
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