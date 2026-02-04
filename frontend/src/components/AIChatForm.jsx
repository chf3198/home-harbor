/**
 * @fileoverview AI Chat Form Component
 */

import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

function AIChatForm({ onSendMessage, onClear, loading, hasResponse }) {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    await onSendMessage(message.trim());
    setMessage('');
  };

  const handleClear = () => {
    onClear();
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="chat-message" className="sr-only">
          Your message
        </label>
        <textarea
          id="chat-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input-field"
          rows="3"
          placeholder="Ask about the market or search tips..."
          disabled={loading}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <LoadingSpinner size="small" />
              <span className="ml-2">Sending...</span>
            </>
          ) : (
            'Send'
          )}
        </button>

        {hasResponse && (
          <button
            type="button"
            onClick={handleClear}
            className="btn-secondary"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}

export default AIChatForm;