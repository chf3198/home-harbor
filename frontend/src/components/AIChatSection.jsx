/**
 * @fileoverview AI Chat Section Component - Messenger-style chat interface
 * @description Primary interaction point with collapsible advanced filters
 */

import React, { useCallback } from 'react';
import { usePropertySearch } from '../hooks/usePropertySearch';
import { useAISearch } from '../hooks/useAISearch';
import AIChatForm from './AIChatForm';
import AIChatMessages from './AIChatMessages';
import CompactFilters from './CompactFilters';

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
    <section className="rounded-2xl bg-white shadow-lg overflow-hidden flex flex-col lg:max-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-lg">🏠</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Ask HomeHarbor</h2>
              <p className="text-emerald-100 text-xs">AI-powered property search</p>
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

      {/* Chat Body - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 min-h-[300px]">
        <AIChatMessages messages={messages} loading={loading} error={error} />
      </div>
      
      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-slate-100 bg-white p-4">
        <AIChatForm
          onSendMessage={sendMessage}
          onClear={clearChat}
          loading={loading}
          hasResponse={hasResponse}
        />
        
        {/* Compact Filters */}
        <CompactFilters />
      </div>
    </section>
  );
}

export default AIChatSection;