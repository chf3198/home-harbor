/**
 * @fileoverview Semantic search hook with RAG integration
 * @description React hook for AI-powered property search
 * @semantic rag, hook, react, search
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { initEmbeddings, isEmbeddingsReady } from '../services/embeddingService.js';
import { initSearchIndex, indexProperties, hybridSearch } from '../services/ragSearchService.js';
import { buildRAGContext } from '../services/searchFilters.js';

/**
 * Hook for semantic property search with RAG
 * @param {Object[]} properties - Properties to index
 * @returns {Object} Search state and methods
 */
export function useSemanticSearch(properties) {
  const [isReady, setIsReady] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexProgress, setIndexProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const indexedRef = useRef(false);

  // Initialize embedding model and index
  useEffect(() => {
    const init = async () => {
      try {
        await initEmbeddings();
        await initSearchIndex();
        setIsReady(true);
      } catch (err) {
        setError(err.message);
      }
    };
    init();
  }, []);

  // Index properties when ready and properties change
  useEffect(() => {
    if (!isReady || !properties?.length || indexedRef.current) return;

    const index = async () => {
      setIsIndexing(true);
      setIndexProgress({ current: 0, total: properties.length });

      try {
        await indexProperties(properties, (current, total) => {
          setIndexProgress({ current, total });
        });
        indexedRef.current = true;
      } catch (err) {
        setError(err.message);
      } finally {
        setIsIndexing(false);
      }
    };
    index();
  }, [isReady, properties]);

  // Perform semantic search
  const search = useCallback(
    async (query, options = {}) => {
      if (!isReady) throw new Error('Search not ready');
      return hybridSearch(query, options);
    },
    [isReady]
  );

  // Search and build RAG context for LLM
  const searchWithContext = useCallback(
    async (query, options = {}) => {
      const results = await search(query, options);
      const context = buildRAGContext(results);
      return { results, context };
    },
    [search]
  );

  return {
    isReady: isReady && !isIndexing,
    isIndexing,
    indexProgress,
    error,
    search,
    searchWithContext,
    isEmbeddingsReady: isEmbeddingsReady(),
  };
}
