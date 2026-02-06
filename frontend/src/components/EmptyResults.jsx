/**
 * @fileoverview Empty Results Component - Beautiful empty state
 */

import React from 'react';

function EmptyResults() {
  const suggestedCities = ['Hartford', 'Stamford', 'New Haven'];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-amber-800 mb-2">No properties found</h3>
      <p className="text-amber-700 mb-4">
        This demo uses Connecticut property data. Try one of these cities:
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {suggestedCities.map(city => (
          <span 
            key={city}
            className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-amber-200 text-amber-700 font-medium text-sm shadow-sm hover:shadow hover:border-amber-300 transition-all cursor-default"
          >
            📍 {city}
          </span>
        ))}
      </div>
    </div>
  );
}

export default EmptyResults;