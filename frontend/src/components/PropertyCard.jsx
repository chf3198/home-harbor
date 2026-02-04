/**
 * @fileoverview Property Card Component
 */

import React from 'react';
import PropertyCardDetails from './PropertyCardDetails';
import PropertyCardAI from './PropertyCardAI';
import PropertyCardActions from './PropertyCardActions';
import { usePropertyDetails } from '../hooks/usePropertyDetails';

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
  const { details, detailsLoading, detailsError, loadPropertyDetails } = usePropertyDetails(property.id);

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
      <PropertyCardActions
        onToggleExpansion={handleToggleExpansion}
        onAnalyze={onAnalyze}
        isExpanded={isExpanded}
        isAnalyzing={isAnalyzing}
        detailsLoading={detailsLoading}
      />

      {/* Details Panel */}
      {isExpanded && (
        <PropertyCardDetails
          details={details}
          detailsError={detailsError}
          detailsLoading={detailsLoading}
        />
      )}

      {/* AI Analysis Panel */}
      <PropertyCardAI aiResponse={aiResponse} aiError={aiError} />
    </div>
  );
}

export default PropertyCard;