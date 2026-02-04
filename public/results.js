/**
 * @fileoverview Results rendering utilities
 */

import { createPropertyCard } from './propertyCard.js';
import { renderPagination } from './pagination.js';

export function renderResults(data, aiReady) {
  const resultsEl = document.getElementById('results');
  resultsEl.innerHTML = '';

  if (!data.length) {
    resultsEl.innerHTML =
      '<div class="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">No properties found. This demo uses Connecticut data—try Hartford, Stamford, or New Haven.</div>';
    return;
  }

  data.forEach((property) => {
    const card = createPropertyCard(property, aiReady);
    resultsEl.appendChild(card);
  });
}

export { renderPagination };