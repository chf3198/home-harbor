/**
 * @fileoverview AI Chat Section Component - Integrates AI chat with property search
 */

import React, { useCallback } from 'react';
import { usePropertySearch } from '../hooks/usePropertySearch';
import { useAISearch } from '../hooks/useAISearch';
import AIChatForm from './AIChatForm';
import AIChatMessages from './AIChatMessages';

function AIChatSection() {
  const { setFilters, searchProperties, results } = usePropertySearch();

  const handleFiltersExtracted = useCallback((filters) => {
    setFilters(filters);
    searchProperties(filters);
  }, [setFilters, searchProperties]);

  const { messages, loading, error, sendMessage, clearChat } = useAISearch(
    handleFiltersExtracted,
    results
  );

  const hasResponse = messages.length > 0 || error;

  return (
    <section className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Ask HomeHarbor</h2>
          <p className="text-sm text-slate-500">AI-powered property search.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">AI</span>
      </div>

      <AIChatForm
        onSendMessage={sendMessage}
        onClear={clearChat}
        loading={loading}
        hasResponse={hasResponse}
      />

      <AIChatMessages messages={messages} loading={loading} error={error} />
    </section>
  );
}

export default AIChatSection;