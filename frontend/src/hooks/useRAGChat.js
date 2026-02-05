/**
 * @fileoverview RAG Chat Hook combining semantic search with AI
 * @description React hook for RAG-powered property Q&A
 * @semantic rag, hook, chat, react
 */

import { useState, useCallback } from 'react';
import { sendRAGMessage, processRAGResponse } from '../services/ragChatService.js';

/**
 * Hook for RAG-enhanced property chat
 * @param {function} searchWithContext - Function from useSemanticSearch
 * @param {string} [apiBase] - API base URL
 * @returns {Object} Chat state and methods
 */
export function useRAGChat(searchWithContext, apiBase = '/api') {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [sources, setSources] = useState([]);

  const askQuestion = useCallback(
    async (query, filters = {}) => {
      setIsLoading(true);
      setError(null);
      setResponse(null);
      setSources([]);

      try {
        // Step 1: Semantic search for relevant properties
        const { results, context } = await searchWithContext(query, {
          limit: 5,
          filters,
        });

        // Step 2: Send to LLM with context
        const aiResponse = await sendRAGMessage(query, context, apiBase);

        // Step 3: Process and return with source attribution
        const processed = processRAGResponse(aiResponse, results);
        setResponse(processed.response);
        setSources(processed.sources);

        return processed;
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [searchWithContext, apiBase]
  );

  const clearChat = useCallback(() => {
    setResponse(null);
    setError(null);
    setSources([]);
  }, []);

  return {
    isLoading,
    response,
    error,
    sources,
    askQuestion,
    clearChat,
  };
}
