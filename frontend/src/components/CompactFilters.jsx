/**
 * @fileoverview Compact Filters Component - Inline advanced filters
 * @description Shows active filters as pills and provides direct filter form
 */

import React from 'react';
import { usePropertySearch } from '../hooks/usePropertySearch';
import CityInput from './CityInput';
import PriceRangeInput from './PriceRangeInput';
import PropertyFilters from './PropertyFilters';

function CompactFilters() {
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
    <div>
      {/* Active Filter Pills */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {activeFilters.map((filter, i) => (
            <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
              {filter}
            </span>
          ))}
          <span className="text-xs text-slate-500">
            {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} applied
          </span>
        </div>
      )}

      {/* Filters Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
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
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Searching...' : 'Search Properties'}
        </button>
      </form>
    </div>
  );
}

export default CompactFilters;
