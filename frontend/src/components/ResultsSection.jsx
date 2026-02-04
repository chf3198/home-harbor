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
    <section className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Search Results</h2>
        {results.length > 0 && (
          <span className="text-sm text-slate-500">
            {pagination.total} results found
          </span>
        )}
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