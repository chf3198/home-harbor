import React, { useState } from 'react';
import { usePropertySearch } from '../hooks/usePropertySearch';
import { useAIChat } from '../hooks/useAIChat';
import PropertyCard from './PropertyCard';
import Pagination from './Pagination';
import LoadingSpinner from './LoadingSpinner';

function ResultsSection() {
  const { results, loading, error, pagination, setPage } = usePropertySearch();
  const { analyzeProperty, sendMessage, loading: aiLoading, response: aiResponse, error: aiError } = useAIChat();

  const [expandedCards, setExpandedCards] = useState(new Set());
  const [analyzingCards, setAnalyzingCards] = useState(new Set());

  const toggleCardExpansion = (propertyId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(propertyId)) {
      newExpanded.delete(propertyId);
    } else {
      newExpanded.add(propertyId);
    }
    setExpandedCards(newExpanded);
  };

  const handleAnalyzeProperty = async (propertyId, analysisType) => {
    setAnalyzingCards(prev => new Set(prev).add(`${propertyId}-${analysisType}`));

    try {
      if (analysisType === 'vision') {
        await analyzeProperty(propertyId);
      } else if (analysisType === 'description') {
        await sendMessage(`Generate a compelling real estate description for property ${propertyId}`, propertyId);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzingCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${propertyId}-${analysisType}`);
        return newSet;
      });
    }
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

  if (loading) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-lg">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-3 text-slate-600">Searching properties...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-lg">
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <strong>Error:</strong> {error}
        </div>
      </section>
    );
  }

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
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-6 text-center">
          <h3 className="text-lg font-medium text-amber-800 mb-2">No properties found</h3>
          <p className="text-amber-700">
            This demo uses Connecticut data—try searching for Hartford, Stamford, or New Haven.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            {results.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isExpanded={expandedCards.has(property.id)}
                isAnalyzing={analyzingCards.has(`${property.id}-vision`) || analyzingCards.has(`${property.id}-description`)}
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