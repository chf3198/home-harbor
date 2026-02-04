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

describe('AIChatSection - Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});