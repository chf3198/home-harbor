/**
 * @fileoverview AI Chat Section Component - Messenger-style chat interface
 */

import React, { useCallback } from 'react';
import { usePropertySearch } from '../hooks/usePropertySearch';
import { useAISearch } from '../hooks/useAISearch';
import AIChatForm from './AIChatForm';
import AIChatMessages from './AIChatMessages';

function AIChatSection() {
  const { setFilters, searchProperties, results } = usePropertySearch();

  const handleFiltersExtracted = useCallback((filters) => {
    console.log('[AIChatSection] handleFiltersExtracted called with:', filters);
    setFilters(filters);
    console.log('[AIChatSection] Calling searchProperties...');
    searchProperties(filters);
  }, [setFilters, searchProperties]);

  const { messages, loading, error, sendMessage, clearChat } = useAISearch(
    handleFiltersExtracted,
    results
  );

  const hasResponse = messages.length > 0 || error;

  return (
    <section className="rounded-2xl bg-white shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-xl">🏠</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Ask HomeHarbor</h2>
              <p className="text-emerald-100 text-xs">AI-powered property search assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 text-white text-xs">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Chat Body */}
      <div className="p-4">
        <AIChatMessages messages={messages} loading={loading} error={error} />
        <AIChatForm
          onSendMessage={sendMessage}
          onClear={clearChat}
          loading={loading}
          hasResponse={hasResponse}
        />
      </div>
    </section>
  );
}

export default AIChatSection;