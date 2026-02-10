/**
 * @fileoverview Chat-Centric View Component
 * @description Full-screen chat interface with integrated swipeable property results
 * 
 * UX Design Pattern: "Search → Browse" Workflow
 * - User chats with AI to search properties
 * - Results appear as swipeable cards inline
 * - No page navigation needed - everything in one view
 * 
 * Inspired by:
 * - ChatGPT/Claude: Conversation-first interface
 * - Tinder/Bumble: Swipeable card browsing
 * - Airbnb: Contextual property cards in search
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { usePropertySearch } from '../hooks/usePropertySearch';
import { useAISearch } from '../hooks/useAISearch';
import AIChatMessages from './AIChatMessages';
import SwipeablePropertyCards from './SwipeablePropertyCards';

/**
 * View modes for the interface
 */
const VIEW_MODES = {
  CHAT: 'chat',
  RESULTS: 'results',
};

function ChatCentricView() {
  const [viewMode, setViewMode] = useState(VIEW_MODES.CHAT);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { 
    results, 
    loading: searchLoading, 
    pagination, 
    setFilters, 
    searchProperties,
    setPage 
  } = usePropertySearch();

  const handleFiltersExtracted = useCallback((filters) => {
    console.log('[ChatCentricView] Filters extracted:', filters);
    setFilters(filters);
    searchProperties(filters);
  }, [setFilters, searchProperties]);

  const { 
    messages, 
    loading: chatLoading, 
    error: chatError, 
    sendMessage, 
    clearChat 
  } = useAISearch(handleFiltersExtracted, results);

  // Auto-switch to results view when properties are found
  useEffect(() => {
    if (results.length > 0 && !searchLoading) {
      setViewMode(VIEW_MODES.RESULTS);
    }
  }, [results, searchLoading]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (viewMode === VIEW_MODES.CHAT) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, viewMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = inputValue.trim();
    if (!message || chatLoading) return;

    setInputValue('');
    setViewMode(VIEW_MODES.CHAT); // Show chat while processing
    await sendMessage(message);
  };

  const handleClear = () => {
    clearChat();
    setViewMode(VIEW_MODES.CHAT);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const hasResults = results.length > 0;
  const hasMessages = messages.length > 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* View Toggle - Only show when we have results */}
      {hasResults && (
        <div className="flex-shrink-0 px-4 py-2 bg-white border-b border-slate-100 z-10">
          <div className="flex items-center justify-center gap-1 bg-slate-100 rounded-xl p-1 max-w-xs mx-auto">
            <button
              onClick={() => setViewMode(VIEW_MODES.CHAT)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all ${
                viewMode === VIEW_MODES.CHAT
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setViewMode(VIEW_MODES.RESULTS)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all ${
                viewMode === VIEW_MODES.RESULTS
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏠 Results ({results.length})
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area - Must be overflow hidden to contain absolute children */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {/* Chat View */}
        <div 
          className={`absolute inset-0 flex flex-col transition-transform duration-300 ${
            viewMode === VIEW_MODES.RESULTS && hasResults ? '-translate-x-full' : 'translate-x-0'
          }`}
        >
          {/* Chat Messages - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {!hasMessages && !chatLoading ? (
              // Welcome State
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                  <span className="text-4xl">🏠</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Welcome to HomeHarbor
                </h2>
                <p className="text-slate-600 mb-6 max-w-sm">
                  Your AI-powered real estate assistant. Search 211K+ Connecticut properties with natural language.
                </p>
                
                {/* Quick Prompts */}
                <div className="space-y-2 w-full max-w-md">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Try asking:</p>
                  {[
                    'Find homes under $400K in West Hartford',
                    'Show me 3 bedroom houses in Stamford',
                    'What properties are available in New Haven?',
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        setInputValue(prompt);
                        inputRef.current?.focus();
                      }}
                      className="w-full text-left px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 transition-colors"
                    >
                      "{prompt}"
                    </button>
                  ))}
                </div>
                
                {/* Feature Badges */}
                <div className="flex items-center gap-3 mt-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs text-emerald-700 font-medium">
                    ✓ 100% Free
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs text-blue-700 font-medium">
                    211K+ Properties
                  </span>
                </div>
              </div>
            ) : (
              // Chat Messages
              <div className="max-w-2xl mx-auto">
                <AIChatMessages 
                  messages={messages} 
                  loading={chatLoading} 
                  error={chatError} 
                />
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Results View (Swipeable Cards) */}
        {hasResults && (
          <div 
            className={`absolute inset-0 flex flex-col bg-slate-50 transition-transform duration-300 ${
              viewMode === VIEW_MODES.RESULTS ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <SwipeablePropertyCards 
              properties={results}
              pagination={pagination}
              onPageChange={setPage}
            />
          </div>
        )}

        {/* Loading Overlay */}
        {searchLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Searching properties...</p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Input Area */}
      <div className="flex-shrink-0 border-t border-slate-200 bg-white p-3 safe-area-inset-bottom">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex items-end gap-2">
            {/* Clear Button */}
            {hasMessages && (
              <button
                type="button"
                onClick={handleClear}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                title="Clear chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            
            {/* Input Field */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about properties... (e.g., 'homes in Hartford under $300K')"
                disabled={chatLoading}
                className="w-full px-4 py-3 pr-12 bg-slate-100 border-0 rounded-2xl text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-50"
              />
              
              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputValue.trim() || chatLoading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {chatLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Keyboard Hint */}
          <p className="text-center text-xs text-slate-400 mt-2 hidden sm:block">
            Press Enter to send • Swipe cards to browse results
          </p>
        </form>
      </div>
    </div>
  );
}

export default ChatCentricView;
