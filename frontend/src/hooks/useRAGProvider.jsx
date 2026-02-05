/**
 * @fileoverview RAG Provider combining property data with semantic search
 * @description Context provider for RAG-powered property Q&A
 * @semantic rag, context, provider
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePropertySearch } from './usePropertySearch';
import { useSemanticSearch } from './useSemanticSearch';
import { useRAGChat } from './useRAGChat';

const RAGContext = createContext();

/**
 * RAG Provider component
 * Initializes semantic search with property data and provides RAG chat
 */
export function RAGProvider({ children, apiBase = '/api' }) {
  const { properties } = usePropertySearch();
  const semanticSearch = useSemanticSearch(properties);
  const ragChat = useRAGChat(semanticSearch.searchWithContext, apiBase);
  const [status, setStatus] = useState('initializing');

  useEffect(() => {
    if (semanticSearch.error) {
      setStatus('error');
    } else if (semanticSearch.isIndexing) {
      setStatus('indexing');
    } else if (semanticSearch.isReady) {
      setStatus('ready');
    }
  }, [semanticSearch.isReady, semanticSearch.isIndexing, semanticSearch.error]);

  const value = {
    // Status
    status,
    isReady: status === 'ready',
    isIndexing: status === 'indexing',
    indexProgress: semanticSearch.indexProgress,
    error: semanticSearch.error || ragChat.error,

    // Semantic search
    search: semanticSearch.search,
    searchWithContext: semanticSearch.searchWithContext,

    // RAG chat
    askQuestion: ragChat.askQuestion,
    chatResponse: ragChat.response,
    chatSources: ragChat.sources,
    isChatLoading: ragChat.isLoading,
    clearChat: ragChat.clearChat,
  };

  return <RAGContext.Provider value={value}>{children}</RAGContext.Provider>;
}

/**
 * Hook to access RAG context
 * @returns {Object} RAG state and methods
 */
export function useRAG() {
  const context = useContext(RAGContext);
  if (!context) {
    throw new Error('useRAG must be used within a RAGProvider');
  }
  return context;
}
