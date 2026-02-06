import React from 'react';
import { usePropertySearch } from '../hooks/usePropertySearch';
import CityInput from './CityInput';
import PriceRangeInput from './PriceRangeInput';
import PropertyFilters from './PropertyFilters';

function SearchSection() {
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
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Search Properties</h2>
            <p className="text-sm text-slate-500">
              Filter by location, price, and property details
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-4 py-2 text-sm text-emerald-700 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Legal + Free Data
          </span>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
            Connecticut demo
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-4">
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

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:from-emerald-500 hover:to-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Searching...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Properties
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

export default SearchSection;