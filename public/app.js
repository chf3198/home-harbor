const form = document.getElementById('search-form');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');
const paginationEl = document.getElementById('pagination');
const chatForm = document.getElementById('chat-form');
const chatResponseEl = document.getElementById('chat-response');
const statusArea = document.getElementById('status');
const helpButton = document.getElementById('help-button');
const helpModal = document.getElementById('help-modal');
const helpClose = document.getElementById('help-close');
const helpTabUser = document.getElementById('help-tab-user');
const helpTabDev = document.getElementById('help-tab-dev');
const helpContent = document.getElementById('help-content');
const citySuggestions = document.getElementById('city-suggestions');
const cityDropdown = document.getElementById('city-dropdown');
const cityChips = document.getElementById('city-chips');
const cityInput = form?.querySelector('input[name="city"]');
const searchButton = form?.querySelector('button[type="submit"]');
const searchProgress = document.getElementById('search-progress');
const localProperties = Array.isArray(window.HOME_HARBOR_DATA)
  ? window.HOME_HARBOR_DATA
  : [];

const configuredCities = Array.isArray(
  window.HOME_HARBOR_CONFIG?.citySuggestions
)
  ? window.HOME_HARBOR_CONFIG?.citySuggestions
  : [];

let aiReady = false;

let currentPage = 1;
let currentQuery = {};

function getApiBase() {
  return window.HOME_HARBOR_CONFIG?.apiBaseUrl || '';
}

const localSample = Array.isArray(window.HOME_HARBOR_SAMPLE)
  ? window.HOME_HARBOR_SAMPLE
  : [];
const localDataById = new Map(
  localSample.map((property) => [String(property.id), property])
);

function usesLocalData() {
  return !getApiBase() && localSample.length > 0;
}

function isApiEnabled() {
  return Boolean(getApiBase());
}

function setStatus(message, tone = 'info') {
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
  if (statusArea) {
    statusArea.textContent = message;
  }
}

function renderHelpContent(type) {
  const guide = window.HOME_HARBOR_HELP?.[type];
  if (!guide || !helpContent) return;

  helpContent.innerHTML = `
    <h4 class="text-base font-semibold text-slate-900">${guide.title}</h4>
    ${guide.sections
      .map(
        (section) => `
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p class="text-sm font-semibold text-slate-800">${section.heading}</p>
          <p class="mt-1 text-sm text-slate-600">${section.body}</p>
        </div>
      `
      )
      .join('')}
  `;
}

function openHelp(type) {
  if (!helpModal) return;
  helpModal.classList.remove('hidden');
  helpModal.classList.add('flex');
  renderHelpContent(type);

  if (type === 'user') {
    helpTabUser.className =
      'rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white';
    helpTabDev.className =
      'rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600';
  } else {
    helpTabDev.className =
      'rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white';
    helpTabUser.className =
      'rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600';
  }
}

function closeHelp() {
  if (!helpModal) return;
  helpModal.classList.add('hidden');
  helpModal.classList.remove('flex');
}

function formatCurrency(value) {
  if (value === undefined || value === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

async function fetchPropertyDetail(propertyId) {
  if (!isApiEnabled()) {
    const localMatch = localProperties.find(
      (property) => String(property.id) === String(propertyId)
    );
    if (!localMatch) {
      return { ok: false, error: 'Property not found in local demo data.' };
    }
    return { ok: true, data: localMatch };
  }

  const response = await fetch(`${getApiBase()}/api/properties/${propertyId}`);
  const detailData = await response.json();
  if (!response.ok) {
    return { ok: false, error: detailData.error || 'Failed to load details' };
  }
  return { ok: true, data: detailData };
}

function renderResults(data) {
  resultsEl.innerHTML = '';

  if (!data.length) {
    resultsEl.innerHTML =
      '<div class="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">No properties found. This demo uses Connecticut data—try Hartford, Stamford, or New Haven.</div>';
    return;
  }

  data.forEach((property) => {
    const card = document.createElement('div');
    card.className =
      'rounded-2xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm';

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
    detailButton.className =
      'rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white';

    const detailPanel = document.createElement('div');
    detailPanel.className =
      'mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600';
    detailPanel.hidden = true;

    const aiPanel = document.createElement('div');
    aiPanel.className =
      'mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900';
    aiPanel.hidden = true;

    const visionButton = document.createElement('button');
    visionButton.type = 'button';
    visionButton.textContent = 'Analyze photo';
    visionButton.className =
      'rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white';

    const descriptionButton = document.createElement('button');
    descriptionButton.type = 'button';
    descriptionButton.textContent = 'Generate description';
    descriptionButton.className =
      'rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white';

    detailButton.addEventListener('click', async () => {
      if (!detailPanel.hidden) {
        detailPanel.hidden = true;
        detailButton.textContent = 'View details';
        return;
      }

      detailButton.textContent = 'Loading...';
      const detailResult = await fetchPropertyDetail(property.id);

      if (!detailResult.ok) {
        detailPanel.textContent = detailResult.error || 'Failed to load details';
      } else {
        const detailData = detailResult.data;
        detailPanel.innerHTML = `
          <p><strong>Address:</strong> ${detailData.address}</p>
          <p><strong>Sale Date:</strong> ${detailData.metadata?.saleDate || 'N/A'}</p>
          <p><strong>Residential Type:</strong> ${detailData.metadata?.residentialType || 'N/A'}</p>
          <p><strong>Serial Number:</strong> ${detailData.metadata?.serialNumber || 'N/A'}</p>
        `;
      }

      detailPanel.hidden = false;
      aiPanel.hidden = false;
      detailButton.textContent = 'Hide details';
    });

    visionButton.addEventListener('click', async () => {
      if (!aiReady) {
        aiPanel.hidden = false;
        aiPanel.textContent = 'AI is not configured. Add API keys first.';
        return;
      }
      aiPanel.hidden = false;
      aiPanel.innerHTML = 'Analyzing photo...';

      const response = await fetch(`${getApiBase()}/api/vision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property.id }),
      });

      const data = await response.json();
      if (!response.ok) {
        aiPanel.textContent = data.error || 'Vision analysis failed';
        return;
      }

      aiPanel.innerHTML = `
        <p><strong>Image URL:</strong> <a href="${data.imageUrl}" target="_blank">View</a></p>
        <p><strong>Style:</strong> ${data.insights.architectural_style || 'N/A'}</p>
        <p><strong>Condition:</strong> ${data.insights.exterior_condition || 'N/A'}</p>
        <p><strong>Curb appeal:</strong> ${data.insights.curb_appeal_score || 'N/A'}</p>
        <p><strong>Features:</strong> ${(data.insights.visible_features || []).join(', ')}</p>
      `;
    });

    descriptionButton.addEventListener('click', async () => {
      if (!aiReady) {
        aiPanel.hidden = false;
        aiPanel.textContent = 'AI is not configured. Add API keys first.';
        return;
      }
      aiPanel.hidden = false;
      aiPanel.innerHTML = 'Generating description...';

      const response = await fetch(`${getApiBase()}/api/describe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property.id }),
      });

      const data = await response.json();
      if (!response.ok) {
        aiPanel.textContent = data.error || 'Description failed';
        return;
      }

      aiPanel.innerHTML = `
        <h4>${data.description.headline || 'Listing Summary'}</h4>
        <p>${data.description.summary || ''}</p>
        <ul>${(data.description.highlights || [])
          .map((item) => `<li>${item}</li>`)
          .join('')}</ul>
      `;
    });

    card.append(
      title,
      price,
      details,
      realtorLink,
      assessed,
      detailButton,
      detailPanel,
      visionButton,
      descriptionButton,
      aiPanel
    );
    resultsEl.appendChild(card);
  });
}

function renderPagination(meta) {
  paginationEl.innerHTML = '';

  const info = document.createElement('span');
  info.textContent = `Page ${meta.page} of ${meta.totalPages} (${meta.totalItems} results)`;

  const prev = document.createElement('button');
  prev.textContent = 'Prev';
  prev.disabled = !meta.hasPrevPage;
  prev.addEventListener('click', () => {
    if (!meta.hasPrevPage) return;
    currentPage -= 1;
    fetchResults();
  });

  const next = document.createElement('button');
  next.textContent = 'Next';
  next.disabled = !meta.hasNextPage;
  next.addEventListener('click', () => {
    if (!meta.hasNextPage) return;
    currentPage += 1;
    fetchResults();
  });

  paginationEl.append(prev, info, next);
}

function matchesText(value, query) {
  if (!query) return true;
  if (!value) return false;
  return value.toLowerCase().includes(query.toLowerCase());
}

function applyLocalFilters(properties, query) {
  return properties.filter((property) => {
    if (query.city && !matchesText(property.city, query.city)) {
      return false;
    }

    if (query.minPrice && Number(property.price) < Number(query.minPrice)) {
      return false;
    }

    if (query.maxPrice && Number(property.price) > Number(query.maxPrice)) {
      return false;
    }

    if (
      query.propertyType &&
      !matchesText(property.metadata?.propertyType, query.propertyType)
    ) {
      return false;
    }

    if (
      query.residentialType &&
      !matchesText(property.metadata?.residentialType, query.residentialType)
    ) {
      return false;
    }

    return true;
  });
}

function sortLocalResults(items, sortBy, sortOrder) {
  if (!sortBy) return items;
  const direction = sortOrder === 'desc' ? -1 : 1;

  return [...items].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'assessedValue') {
      aValue = a.metadata?.assessedValue;
      bValue = b.metadata?.assessedValue;
    }

    if (sortBy === 'saleDate') {
      aValue = a.metadata?.saleDate ? new Date(a.metadata.saleDate).getTime() : 0;
      bValue = b.metadata?.saleDate ? new Date(b.metadata.saleDate).getTime() : 0;
    }

    if (sortBy === 'city') {
      aValue = a.city || '';
      bValue = b.city || '';
    }

    if (typeof aValue === 'string') {
      return aValue.localeCompare(String(bValue)) * direction;
    }

    return (Number(aValue) - Number(bValue)) * direction;
  });
}

function buildLocalResponse(query, page, pageSize) {
  const filtered = applyLocalFilters(localProperties, query);
  const sorted = sortLocalResults(filtered, query.sortBy, query.sortOrder);
  const size = pageSize > 0 ? pageSize : 10;
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * size;
  const data = sorted.slice(startIndex, startIndex + size);

  return {
    data,
    page: safePage,
    totalPages,
    totalItems,
    hasPrevPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  };
}

async function fetchResults() {
  setStatus('Searching properties...', 'info');
  setLoading(true);

  try {
    if (!isApiEnabled()) {
      const pageSize = Number(currentQuery.pageSize || 10);
      const data = buildLocalResponse(currentQuery, currentPage, pageSize);
      setStatus(
        `Loaded ${data.data.length} properties (local demo)`,
        data.data.length ? 'success' : 'error'
      );
      renderResults(data.data);
      renderPagination(data);
      return;
    }

    const params = new URLSearchParams({ ...currentQuery, page: currentPage });

    const response = await fetch(
      `${getApiBase()}/api/properties?${params.toString()}`
    );
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || 'Failed to load properties', 'error');
      return;
    }

    setStatus(`Loaded ${data.data.length} properties`, 'success');
    renderResults(data.data);
    renderPagination(data);
  } catch (error) {
    setStatus(`Failed to load properties: ${error.message}`, 'error');
  } finally {
    setLoading(false);
  }
}

async function fetchConfig() {
  try {
    const response = await fetch(`${getApiBase()}/api/config`);
    const data = await response.json();
    aiReady = Boolean(data.aiReady);

    if (!aiReady) {
      setAiStatus(
        `AI disabled. Missing keys: ${data.missingKeys.join(', ')}`
      );
    }
  } catch (error) {
    setAiStatus('Unable to load AI configuration.');
  }
}

const fallbackCities = configuredCities.length
  ? configuredCities
  : Array.isArray(window.HOME_HARBOR_CITIES) && window.HOME_HARBOR_CITIES.length
    ? window.HOME_HARBOR_CITIES
    : localProperties.length
      ? [...new Set(localProperties.map((property) => property.city))]
      : [
          'Bridgeport',
          'Danbury',
          'Hartford',
          'Milford',
          'New Britain',
          'New Haven',
          'Norwalk',
          'Stamford',
          'Stratford',
          'Waterbury',
          'West Hartford',
        ];

let availableCities = [...fallbackCities];

function normalizeCity(value) {
  return value.trim().toLowerCase();
}

function hideCityDropdown() {
  if (!cityDropdown) return;
  cityDropdown.classList.add('hidden');
  cityDropdown.innerHTML = '';
}

function setCityValue(value) {
  if (!cityInput) return;
  cityInput.value = value;
  hideCityDropdown();
  cityInput.focus();
}

function getCityMatches(query) {
  if (!query) return [];
  const normalized = normalizeCity(query);
  return availableCities.filter((city) =>
    city.toLowerCase().startsWith(normalized)
  );
}

function renderCityDropdown(matches) {
  if (!cityDropdown) return;

  if (!matches.length) {
    hideCityDropdown();
    return;
  }

  cityDropdown.innerHTML = '';
  matches.slice(0, 6).forEach((city) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className =
      'flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-700 hover:bg-emerald-50';
    button.dataset.city = city;
    button.textContent = city;
    button.addEventListener('click', () => setCityValue(city));
    cityDropdown.appendChild(button);
  });

  cityDropdown.classList.remove('hidden');
}

function updateCityDropdown() {
  if (!cityInput) return;
  const query = cityInput.value.trim();

  if (!query) {
    hideCityDropdown();
    return;
  }

  const matches = getCityMatches(query);
  renderCityDropdown(matches);
}

function renderCitySuggestions(cities) {
  if (!citySuggestions) return;
  citySuggestions.innerHTML = cities
    .map((city) => `<option value="${city}"></option>`)
    .join('');
}

function renderCityChips(cities) {
  if (!cityChips) return;

  const topCities = cities.slice(0, 8);
  cityChips.innerHTML = topCities
    .map(
      (city) =>
        `<button type="button" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200" data-city="${city}">${city}</button>`
    )
    .join('');

  cityChips.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      const selectedCity = button.dataset.city || '';
      setCityValue(selectedCity);
    });
  });
}

function setCityList(cities) {
  availableCities = Array.isArray(cities) && cities.length ? cities : fallbackCities;
  renderCitySuggestions(availableCities);
  renderCityChips(availableCities);
}

async function fetchCitySuggestions() {
  if (!citySuggestions) return;

  if (!getApiBase()) {
    setCityList(fallbackCities);
    return;
  }

  try {
    const response = await fetch(`${getApiBase()}/api/cities`);
    const data = await response.json();

    if (!response.ok || !Array.isArray(data.cities) || !data.cities.length) {
      setCityList(fallbackCities);
      return;
    }

    setCityList(data.cities);
  } catch (error) {
    setCityList(fallbackCities);
  }
}

function parseNumberValue(value) {
  if (value === '' || value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function validateQuery(query) {
  const errors = [];
  if (query.minPrice !== null && query.minPrice < 0) {
    errors.push('Min price cannot be negative.');
  }
  if (query.maxPrice !== null && query.maxPrice < 0) {
    errors.push('Max price cannot be negative.');
  }
  if (
    query.minPrice !== null &&
    query.maxPrice !== null &&
    query.minPrice > query.maxPrice
  ) {
    errors.push('Min price must be less than or equal to max price.');
  }
  return errors;
}

if (cityInput) {
  if (cityInput.hasAttribute('list')) {
    cityInput.removeAttribute('list');
  }

  cityInput.addEventListener('input', updateCityDropdown);
  cityInput.addEventListener('focus', updateCityDropdown);
  cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      const query = cityInput.value.trim();
      const matches = getCityMatches(query);
      if (matches.length) {
        const nextCity = matches[0];
        if (normalizeCity(nextCity) !== normalizeCity(query)) {
          event.preventDefault();
          setCityValue(nextCity);
        }
      }
      return;
    }

    if (event.key === 'Escape') {
      hideCityDropdown();
    }
  });

  cityInput.addEventListener('blur', () => {
    setTimeout(hideCityDropdown, 120);
  });
}

if (cityDropdown) {
  cityDropdown.addEventListener('mousedown', (event) => {
    event.preventDefault();
  });
}

document.addEventListener('click', (event) => {
  if (!cityInput || !cityDropdown) return;
  const target = event.target;
  if (target && (cityInput.contains(target) || cityDropdown.contains(target))) {
    return;
  }
  hideCityDropdown();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  currentQuery = {};

  formData.forEach((value, key) => {
    if (value !== '') {
      currentQuery[key] = value;
    }
  });

  const normalizedQuery = {
    ...currentQuery,
    minPrice: parseNumberValue(currentQuery.minPrice),
    maxPrice: parseNumberValue(currentQuery.maxPrice),
    pageSize: Number(currentQuery.pageSize || 10),
  };

  const errors = validateQuery(normalizedQuery);
  if (errors.length) {
    setStatus(errors.join(' '), 'error');
    setLoading(false);
    return;
  }

  currentQuery = normalizedQuery;

  currentPage = 1;
  fetchResults();
});

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  chatResponseEl.textContent = 'Thinking...';

  const message = chatForm.message.value.trim();
  if (!message) {
    chatResponseEl.textContent = 'Please enter a question.';
    return;
  }

  const response = await fetch(`${getApiBase()}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();
  if (!response.ok) {
    chatResponseEl.textContent = data.error || 'Chat failed.';
    return;
  }

  chatResponseEl.textContent = `${data.message} (model: ${data.model})`;
});

if (helpButton) {
  helpButton.addEventListener('click', () => openHelp('user'));
}

if (helpClose) {
  helpClose.addEventListener('click', closeHelp);
}

if (helpTabUser) {
  helpTabUser.addEventListener('click', () => openHelp('user'));
}

if (helpTabDev) {
  helpTabDev.addEventListener('click', () => openHelp('developer'));
}

fetchConfig();
fetchCitySuggestions();
fetchResults().catch((error) => {
  setStatus(`Failed to load properties: ${error.message}`);
});
