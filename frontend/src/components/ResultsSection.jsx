/**
 * @fileoverview Results Section Component
 */

import React, { useState } from 'react';
import { usePropertySearch } from '../hooks/usePropertySearch';
import { useAIChat } from '../hooks/useAIChat';
import { usePropertyAnalysis } from '../hooks/usePropertyAnalysis';
import PropertyCard from './PropertyCard';
import Pagination from './Pagination';
import ResultsLoading from './ResultsLoading';
import ResultsError from './ResultsError';
import EmptyResults from './EmptyResults';

function ResultsSection() {
  const { results, loading, error, pagination, setPage } = usePropertySearch();
  const { response: aiResponse, error: aiError } = useAIChat();
  const { handleAnalyzeProperty, isAnalyzing } = usePropertyAnalysis();

  const [expandedCards, setExpandedCards] = useState(new Set());

  const toggleCardExpansion = (propertyId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(propertyId)) {
      newExpanded.delete(propertyId);
    } else {
      newExpanded.add(propertyId);
    }
    setExpandedCards(newExpanded);
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) return <ResultsLoading />;

  if (error) return <ResultsError error={error} />;

  return (
    <section className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Search Results</h2>
            {results.length > 0 && pagination && (
              <p className="text-sm text-slate-500">
                {pagination.total || results.length} properties found
              </p>
            )}
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyResults />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            {results.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isExpanded={expandedCards.has(property.id)}
                isAnalyzing={isAnalyzing(property.id, 'vision') || isAnalyzing(property.id, 'description')}
                aiResponse={aiResponse}
                aiError={aiError}
                onToggleExpansion={() => toggleCardExpansion(property.id)}
                onAnalyze={(type) => handleAnalyzeProperty(property.id, type)}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </section>
  );
}

export default ResultsSection;