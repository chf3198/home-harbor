/**
 * @fileoverview AI Chat Section Component
 */

import React from 'react';
import { useAIChat } from '../hooks/useAIChat';
import AIChatForm from './AIChatForm';
import AIChatResponse from './AIChatResponse';

function AIChatSection() {
  const { sendMessage, response, loading, error, clearChat } = useAIChat();

  const handleSendMessage = async (message) => {
    await sendMessage(message);
  };

  const handleClear = () => {
    clearChat();
  };

  const hasResponse = response || error;

  return (
    <section className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Ask HomeHarbor</h2>
          <p className="text-sm text-slate-500">AI assistance using OpenRouter.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">AI</span>
      </div>

      <AIChatForm
        onSendMessage={handleSendMessage}
        onClear={handleClear}
        loading={loading}
        hasResponse={hasResponse}
      />

      <AIChatResponse
        response={response}
        error={error}
        loading={loading}
      />
    </section>
  );
}

export default AIChatSection;