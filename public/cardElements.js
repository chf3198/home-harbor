/**
 * @fileoverview Property card element creation utilities
 */

import { formatCurrency } from './ui.js';

export function createCardElements(property) {
  const card = document.createElement('div');
  card.className = 'rounded-2xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm';

  const title = document.createElement('h3');
  title.textContent = property.address;
  title.className = 'text-base font-semibold text-slate-900';

  const price = document.createElement('p');
  price.textContent = `Price: ${formatCurrency(property.price)}`;
  price.className = 'text-sm text-slate-600';

  const details = document.createElement('p');
  details.textContent = `City: ${property.city} | Type: ${property.metadata?.propertyType || 'N/A'}`;
  details.className = 'text-sm text-slate-500';

  const realtorLink = document.createElement('a');
  realtorLink.href = `https://www.realtor.com/realestateandhomes-search/${encodeURIComponent(property.address)}`;
  realtorLink.target = '_blank';
  realtorLink.rel = 'noopener noreferrer';
  realtorLink.textContent = 'View on Realtor.com';
  realtorLink.className = 'text-xs font-semibold text-emerald-700 hover:underline';

  const assessed = document.createElement('p');
  assessed.textContent = `Assessed: ${formatCurrency(property.metadata?.assessedValue)}`;
  assessed.className = 'text-sm text-slate-500';

  const detailButton = document.createElement('button');
  detailButton.type = 'button';
  detailButton.textContent = 'View details';
  detailButton.className = 'rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white';

  const detailPanel = document.createElement('div');
  detailPanel.className = 'mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600';
  detailPanel.hidden = true;

  const aiPanel = document.createElement('div');
  aiPanel.className = 'mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900';
  aiPanel.hidden = true;

  const visionButton = document.createElement('button');
  visionButton.type = 'button';
  visionButton.textContent = 'Analyze photo';
  visionButton.className = 'rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white';

  const descriptionButton = document.createElement('button');
  descriptionButton.type = 'button';
  descriptionButton.textContent = 'Generate description';
  descriptionButton.className = 'rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white';

  return {
    card,
    title,
    price,
    details,
    realtorLink,
    assessed,
    detailButton,
    detailPanel,
    aiPanel,
    visionButton,
    descriptionButton,
  };
}