/**
 * @fileoverview Property card event handling utilities
 */

import { getApiBase } from './configUtils.js';
import { fetchPropertyDetail } from './propertyDetail.js';

export function setupCardEvents(elements, property, aiReady) {
  const { detailButton, detailPanel, aiPanel, visionButton, descriptionButton } = elements;

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
}