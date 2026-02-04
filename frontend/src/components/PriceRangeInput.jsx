import React from 'react';

function PriceRangeInput({ minPrice, maxPrice, onMinChange, onMaxChange }) {
  return (
    <>
      {/* Min Price */}
      <div>
        <label htmlFor="minPrice" className="block text-sm font-medium text-slate-600">
          Min Price
        </label>
        <input
          type="number"
          id="minPrice"
          name="minPrice"
          value={minPrice}
          onChange={(e) => onMinChange(e.target.value)}
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
          value={maxPrice}
          onChange={(e) => onMaxChange(e.target.value)}
          className="input-field"
          placeholder="500000"
          min="0"
        />
      </div>
    </>
  );
}

export default PriceRangeInput;