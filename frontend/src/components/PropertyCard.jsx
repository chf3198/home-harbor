import React, { useState, useEffect } from 'react';

function PropertyCard({
  property,
  isExpanded,
  isAnalyzing,
  aiResponse,
  aiError,
  onToggleExpansion,
  onAnalyze,
  formatCurrency
}) {
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  const loadPropertyDetails = async () => {
    if (details) return; // Already loaded

    setDetailsLoading(true);
    setDetailsError(null);

    try {
      const response = await fetch(`/api/properties/${property.id}`);
      if (!response.ok) {
        throw new Error('Failed to load property details');
      }
      const data = await response.json();
      setDetails(data);
    } catch (error) {
      setDetailsError(error.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleToggleExpansion = async () => {
    if (!isExpanded) {
      await loadPropertyDetails();
    }
    onToggleExpansion();
  };

  const getRealtorUrl = (address) => {
    return `https://www.realtor.com/realestateandhomes-search/${encodeURIComponent(address)}`;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm">
      {/* Property Header */}
      <div className="mb-3">
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          {property.address}
        </h3>
        <p className="text-sm text-slate-600 mb-1">
          Price: {formatCurrency(property.price)}
        </p>
        <p className="text-sm text-slate-500">
          City: {property.city} | Type: {property.metadata?.propertyType || 'N/A'}
        </p>
      </div>

      {/* Realtor Link */}
      <div className="mb-3">
        <a
          href={getRealtorUrl(property.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-emerald-700 hover:underline"
        >
          View on Realtor.com →
        </a>
      </div>

      {/* Assessed Value */}
      {property.metadata?.assessedValue && (
        <p className="text-sm text-slate-500 mb-3">
          Assessed: {formatCurrency(property.metadata.assessedValue)}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={handleToggleExpansion}
          className="btn-secondary text-xs"
          disabled={detailsLoading}
        >
          {detailsLoading ? 'Loading...' : isExpanded ? 'Hide details' : 'View details'}
        </button>

        <button
          onClick={() => onAnalyze('vision')}
          disabled={isAnalyzing}
          className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze photo'}
        </button>

        <button
          onClick={() => onAnalyze('description')}
          disabled={isAnalyzing}
          className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? 'Generating...' : 'Generate description'}
        </button>
      </div>

      {/* Details Panel */}
      {isExpanded && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
          {detailsError ? (
            <p className="text-red-600">{detailsError}</p>
          ) : details ? (
            <div className="space-y-1">
              <p><strong>Address:</strong> {details.address}</p>
              <p><strong>Sale Date:</strong> {details.metadata?.saleDate || 'N/A'}</p>
              <p><strong>Residential Type:</strong> {details.metadata?.residentialType || 'N/A'}</p>
              <p><strong>Serial Number:</strong> {details.metadata?.serialNumber || 'N/A'}</p>
            </div>
          ) : (
            <p>Loading details...</p>
          )}
        </div>
      )}

      {/* AI Analysis Panel */}
      {(aiResponse || aiError) && (
        <div className={`mt-3 rounded-xl border p-3 text-sm ${
          aiError
            ? 'border-red-100 bg-red-50 text-red-900'
            : 'border-emerald-100 bg-emerald-50 text-emerald-900'
        }`}>
          {aiError ? (
            <p>{aiError}</p>
          ) : (
            <div>
              <h4 className="font-medium mb-2">AI Analysis</h4>
              <div className="whitespace-pre-wrap">{aiResponse}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PropertyCard;