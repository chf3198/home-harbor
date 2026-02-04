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
    <section className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Search Properties</h2>
          <p className="text-sm text-slate-500">
            Filter by location, price, and property details.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            Legal + Free Data
          </span>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
            Connecticut-only demo
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search Properties'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default SearchSection;