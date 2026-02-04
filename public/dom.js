/**
 * @fileoverview DOM element references and state management
 */

// DOM element references
export const elements = {
  form: document.querySelector('form'),
  cityInput: document.getElementById('city'),
  minPriceInput: document.getElementById('min-price'),
  maxPriceInput: document.getElementById('max-price'),
  propertyTypeSelect: document.getElementById('property-type'),
  residentialTypeSelect: document.getElementById('residential-type'),
  sortBySelect: document.getElementById('sort-by'),
  sortOrderSelect: document.getElementById('sort-order'),
  resultsEl: document.getElementById('results'),
  paginationEl: document.getElementById('pagination'),
  chatForm: document.getElementById('chat-form'),
  chatInput: document.getElementById('chat-input'),
  chatResponseEl: document.getElementById('chat-response'),
  helpButton: document.getElementById('help-button'),
  helpClose: document.getElementById('help-close'),
  helpTabUser: document.getElementById('help-tab-user'),
  helpTabDev: document.getElementById('help-tab-dev'),
};

// State
export let currentPage = 1;
export let currentQuery = {};