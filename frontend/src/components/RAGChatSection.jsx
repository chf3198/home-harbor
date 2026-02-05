/**
 * @fileoverview RAG-enhanced AI Chat Section
 * @description Chat component with semantic search integration
 * @semantic rag, chat, component
 */

import React, { useState } from 'react';
import { useRAG } from '../hooks/useRAGProvider';
import {
  RAGStatusBadge,
  IndexingProgress,
  ErrorDisplay,
  ResponseDisplay,
} from './RAGChatComponents';

function RAGChatSection() {
  const [query, setQuery] = useState('');
  const {
    isReady,
    isIndexing,
    indexProgress,
    askQuestion,
    chatResponse,
    chatSources,
    isChatLoading,
    clearChat,
    error,
  } = useRAG();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || !isReady) return;
    await askQuestion(query);
  };

  const handleClear = () => {
    setQuery('');
    clearChat();
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Ask HomeHarbor AI
          </h2>
          <p className="text-sm text-slate-500">
            Semantic search powered by Orama + Transformers.js
          </p>
        </div>
        <RAGStatusBadge isReady={isReady} isIndexing={isIndexing} />
      </div>

      {isIndexing && <IndexingProgress progress={indexProgress} />}

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about properties..."
            disabled={!isReady || isChatLoading}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2
                       focus:border-emerald-500 focus:outline-none focus:ring-1
                       focus:ring-emerald-500 disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={!isReady || isChatLoading || !query.trim()}
            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold
                       text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isChatLoading ? 'Thinking...' : 'Ask'}
          </button>
          {(chatResponse || error) && (
            <button type="button" onClick={handleClear} className="btn-secondary">
              Clear
            </button>
          )}
        </div>
      </form>

      {error && <ErrorDisplay message={error} />}
      {chatResponse && (
        <ResponseDisplay response={chatResponse} sources={chatSources} />
      )}
    </section>
  );
}

export default RAGChatSection;
