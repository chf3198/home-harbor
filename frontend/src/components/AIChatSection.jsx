import React, { useState } from 'react';
import { useAIChat } from '../hooks/useAIChat';
import LoadingSpinner from './LoadingSpinner';

function AIChatSection() {
  const { sendMessage, response, loading, error, clearChat } = useAIChat();
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    await sendMessage(message.trim());
    setMessage('');
  };

  const handleClear = () => {
    clearChat();
    setMessage('');
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Ask HomeHarbor</h2>
          <p className="text-sm text-slate-500">AI assistance using OpenRouter.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">AI</span>
      </div>

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
            aria-describedby={error ? "chat-error" : undefined}
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

          {(response || error) && (
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

      {/* Response Area */}
      <div className="mt-4">
        {error && (
          <div
            id="chat-error"
            className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
            role="alert"
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {response && !error && (
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            <div className="whitespace-pre-wrap">{response}</div>
          </div>
        )}

        {!response && !error && !loading && (
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 italic">
            AI responses will appear here. Try asking about Connecticut real estate or search tips!
          </div>
        )}
      </div>
    </section>
  );
}

export default AIChatSection;