import React, { useState, useEffect } from 'react';
import { usePropertySearch } from '../hooks/usePropertySearch';

function SearchSection() {
  const { filters, setFilters, searchProperties, loading, clearResults } = usePropertySearch();
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load city data
  useEffect(() => {
    fetch('/cities.json')
      .then(response => response.json())
      .then(data => setCitySuggestions(data.cities || []))
      .catch(error => console.error('Failed to load cities:', error));
  }, []);

  const handleInputChange = (field, value) => {
    setFilters({ [field]: value });

    if (field === 'city' && value.length > 0) {
      // Filter cities based on input
      const matches = citySuggestions
        .filter(city => city.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleCitySelect = (city) => {
    setFilters({ city });
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearResults();
    searchProperties(filters, 1);
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
          {/* City Input */}
          <div className="relative">
            <label htmlFor="city" className="block text-sm font-medium text-slate-600">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={filters.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="input-field"
              placeholder="Enter city name"
              autoComplete="off"
            />
            {showSuggestions && (
              <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
                {citySuggestions
                  .filter(city => city.toLowerCase().includes(filters.city.toLowerCase()))
                  .slice(0, 5)
                  .map((city, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                    >
                      {city}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Min Price */}
          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium text-slate-600">
              Min Price
            </label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={filters.minPrice}
              onChange={(e) => handleInputChange('minPrice', e.target.value)}
              className="input-field"
              placeholder="100000"
              min="0"
            />
          </div>

          {/* Max Price */}
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-slate-600">
              Max Price
            </label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={(e) => handleInputChange('maxPrice', e.target.value)}
              className="input-field"
              placeholder="500000"
              min="0"
            />
          </div>

          {/* Bedrooms */}
          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-slate-600">
              Bedrooms
            </label>
            <select
              id="bedrooms"
              name="bedrooms"
              value={filters.bedrooms}
              onChange={(e) => handleInputChange('bedrooms', e.target.value)}
              className="input-field"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Bathrooms */}
          <div>
            <label htmlFor="bathrooms" className="block text-sm font-medium text-slate-600">
              Bathrooms
            </label>
            <select
              id="bathrooms"
              name="bathrooms"
              value={filters.bathrooms}
              onChange={(e) => handleInputChange('bathrooms', e.target.value)}
              className="input-field"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-slate-600">
              Property Type
            </label>
            <select
              id="propertyType"
              name="propertyType"
              value={filters.propertyType}
              onChange={(e) => handleInputChange('propertyType', e.target.value)}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="single-family">Single Family</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="multi-family">Multi-Family</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search Properties'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

export default SearchSection;