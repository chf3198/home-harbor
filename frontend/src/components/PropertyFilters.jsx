import React from 'react';

function PropertyFilters({ bedrooms, bathrooms, propertyType, onBedroomsChange, onBathroomsChange, onPropertyTypeChange }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Bedrooms */}
      <div>
        <label htmlFor="bedrooms" className="block text-sm font-medium text-slate-600">
          Bedrooms
        </label>
        <select
          id="bedrooms"
          name="bedrooms"
          value={bedrooms}
          onChange={(e) => onBedroomsChange(e.target.value)}
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

      {/* Bathrooms */}
      <div>
        <label htmlFor="bathrooms" className="block text-sm font-medium text-slate-600">
          Bathrooms
        </label>
        <select
          id="bathrooms"
          name="bathrooms"
          value={bathrooms}
          onChange={(e) => onBathroomsChange(e.target.value)}
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
          value={propertyType}
          onChange={(e) => onPropertyTypeChange(e.target.value)}
          className="input-field"
        >
          <option value="">All Types</option>
          <option value="single-family">Single Family</option>
          <option value="condo">Condo</option>
          <option value="townhouse">Townhouse</option>
          <option value="multi-family">Multi-Family</option>
        </select>
      </div>
    </div>
  );
}

export default PropertyFilters;