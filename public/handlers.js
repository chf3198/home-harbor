/**
 * @fileoverview Event handlers
 */

import { getApiBase, usesLocalData, normalizeCity } from './configUtils.js';
import { setStatus, setLoading, setAiStatus } from './ui.js';
import { openHelp, closeHelp } from './help.js';
import { applyLocalFilters, sortLocalResults, buildLocalResponse } from './search.js';
import { renderResults, renderPagination } from './results.js';
import { currentPage, currentQuery } from './dom.js';

// Handle form submission
export function handleSearch(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const query = {
    city: normalizeCity(formData.get('city')),
    minPrice: formData.get('minPrice'),
    maxPrice: formData.get('maxPrice'),
    propertyType: formData.get('propertyType'),
    residentialType: formData.get('residentialType'),
    sortBy: formData.get('sortBy'),
    sortOrder: formData.get('sortOrder'),
    page: 1,
    limit: 20,
  };
  currentPage = 1;
  fetchResults(query);
}

// Handle chat form submission
export async function handleChat(event) {
  event.preventDefault();
  const message = event.target.querySelector('#chat-input').value.trim();
  if (!message) return;

  setAiStatus('Thinking...');
  const chatInput = event.target.querySelector('#chat-input');
  chatInput.disabled = true;

  try {
    const response = await fetch(`${getApiBase()}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const chatResponseEl = document.getElementById('chat-response');
    chatResponseEl.textContent = `${data.message} (model: ${data.model})`;
  } catch (error) {
    const chatResponseEl = document.getElementById('chat-response');
    chatResponseEl.textContent = `Error: ${error.message}`;
  } finally {
    chatInput.disabled = false;
    chatInput.value = '';
    setAiStatus('');
  }
}

// Fetch results
export async function fetchResults(query = {}) {
  setLoading(true);
  currentQuery = query;

  try {
    if (usesLocalData()) {
      const filtered = applyLocalFilters(window.HOME_HARBOR_SAMPLE, query);
      const sorted = sortLocalResults(filtered, query.sortBy, query.sortOrder);
      const response = buildLocalResponse(sorted, query.page || 1, query.limit || 20);
      renderResults(response.data, true);
      renderPagination(response.meta);
      setStatus(`Found ${response.meta.totalItems} properties`);
    } else {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      const response = await fetch(`${getApiBase()}/api/properties?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      renderResults(data.data, false);
      renderPagination(data.meta);
      setStatus(`Found ${data.meta.totalItems} properties`);
    }
  } catch (error) {
    setStatus(`Failed to load properties: ${error.message}`, 'error');
  } finally {
    setLoading(false);
  }
}