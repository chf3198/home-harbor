/**
 * @fileoverview Compact Filters Component - Collapsible advanced filters
 * @description Shows applied filters as pills and expands to full form on demand
 */

import React, { useState } from 'react';
import { usePropertySearch } from '../hooks/usePropertySearch';
import CityInput from './CityInput';
import PriceRangeInput from './PriceRangeInput';
import PropertyFilters from './PropertyFilters';

function CompactFilters() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { filters, setFilters, searchProperties, loading, clearResults } = usePropertySearch();

  const handleInputChange = (field, value) => {
    setFilters({ [field]: value });
  };

  const handleCitySelect = (city) => {
    setFilters({ city });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearResults();
    searchProperties(filters, 1);
    setIsExpanded(false);
  };

  // Count active filters
  const activeFilters = [
    filters.city && `📍 ${filters.city}`,
    filters.minPrice && `Min $${Number(filters.minPrice).toLocaleString()}`,
    filters.maxPrice && `Max $${Number(filters.maxPrice).toLocaleString()}`,
    filters.bedrooms && `${filters.bedrooms}+ beds`,
    filters.bathrooms && `${filters.bathrooms}+ baths`,
    filters.propertyType && filters.propertyType !== 'all' && filters.propertyType,
  ].filter(Boolean);

  return (
    <div className="border-t border-slate-100 mt-4 pt-4">
      {/* Filter Pills + Toggle */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors"
        >
          <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {isExpanded ? 'Hide Filters' : 'Advanced Filters'}
        </button>
        
        {activeFilters.length > 0 && (
          <>
            {activeFilters.map((filter, i) => (
              <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                {filter}
              </span>
            ))}
            <span className="text-xs text-slate-500">
              {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} applied
            </span>
          </>
        )}
      </div>

      {/* Expandable Filters Form */}
      {isExpanded && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 p-4 bg-slate-50 rounded-xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CityInput
              value={filters.city}
              onChange={(value) => handleInputChange('city', value)}
              onSelect={handleCitySelect}
            />
            <PriceRangeInput
              minPrice={filters.minPrice}
              maxPrice={filters.maxPrice}
              onMinChange={(value) => handleInputChange('minPrice', value)}
              onMaxChange={(value) => handleInputChange('maxPrice', value)}
            />
          </div>

          <PropertyFilters
            bedrooms={filters.bedrooms}
            bathrooms={filters.bathrooms}
            propertyType={filters.propertyType}
            onBedroomsChange={(value) => handleInputChange('bedrooms', value)}
            onBathroomsChange={(value) => handleInputChange('bathrooms', value)}
            onPropertyTypeChange={(value) => handleInputChange('propertyType', value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Searching...' : 'Apply Filters'}
          </button>
        </form>
      )}
    </div>
  );
}

export default CompactFilters;
