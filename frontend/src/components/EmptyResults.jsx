/**
 * @fileoverview Empty Results Component
 */

import React from 'react';

function EmptyResults() {
  return (
    <div className="rounded-xl border border-amber-100 bg-amber-50 p-6 text-center">
      <h3 className="text-lg font-medium text-amber-800 mb-2">No properties found</h3>
      <p className="text-amber-700">
        This demo uses Connecticut data—try searching for Hartford, Stamford, or New Haven.
      </p>
    </div>
  );
}

export default EmptyResults;