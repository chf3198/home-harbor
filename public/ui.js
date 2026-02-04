/**
 * @fileoverview UI manipulation utilities
 */

function setStatus(message, tone = 'info') {
  const statusEl = document.getElementById('status');
  if (!statusEl) return;
  statusEl.textContent = message || '';
  statusEl.classList.remove('text-slate-500', 'text-emerald-700', 'text-rose-600');
  if (tone === 'success') {
    statusEl.classList.add('text-emerald-700');
    return;
  }
  if (tone === 'error') {
    statusEl.classList.add('text-rose-600');
    return;
  }
  statusEl.classList.add('text-slate-500');
}

function setLoading(isLoading) {
  const searchButton = document.querySelector('button[type="submit"]');
  const searchProgress = document.getElementById('search-progress');
  if (searchButton) {
    searchButton.disabled = isLoading;
    searchButton.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    searchButton.textContent = isLoading ? 'Searching...' : 'Search';
    searchButton.classList.toggle('opacity-70', isLoading);
    searchButton.classList.toggle('cursor-wait', isLoading);
  }
  if (searchProgress) {
    searchProgress.classList.toggle('hidden', !isLoading);
    searchProgress.classList.toggle('flex', isLoading);
  }
}

function setAiStatus(message) {
  const statusArea = document.getElementById('status');
  if (statusArea) {
    statusArea.textContent = message;
  }
}

function formatCurrency(value) {
  if (!value || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export { setStatus, setLoading, setAiStatus, formatCurrency };