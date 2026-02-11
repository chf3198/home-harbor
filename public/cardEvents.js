/**
 * @fileoverview Property card event handling utilities
 */

import { getApiBase } from './configUtils.js';
import { fetchPropertyDetail, enrichProperty } from './propertyDetail.js';

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
    
    // Also fetch CAMA enrichment data
    const enrichResult = await enrichProperty(property.address, property.city);

    if (!detailResult.ok) {
      detailPanel.textContent = detailResult.error || 'Failed to load details';
    } else {
      const detailData = detailResult.data;
      let detailHTML = `
        <p><strong>Address:</strong> ${detailData.address}</p>
        <p><strong>Sale Date:</strong> ${detailData.metadata?.saleDate || 'N/A'}</p>
        <p><strong>Residential Type:</strong> ${detailData.metadata?.residentialType || 'N/A'}</p>
        <p><strong>Serial Number:</strong> ${detailData.metadata?.serialNumber || 'N/A'}</p>
      `;
      
      // Add CAMA enrichment data if available
      if (enrichResult.ok && enrichResult.data) {
        const e = enrichResult.data;
        detailHTML += `
          <hr class="my-2" />
          <p class="text-emerald-700 font-semibold">Property Details:</p>
          ${e.beds ? `<p><strong>Bedrooms:</strong> ${e.beds}</p>` : ''}
          ${e.baths ? `<p><strong>Bathrooms:</strong> ${e.baths}${e.halfBaths ? ` + ${e.halfBaths} half` : ''}</p>` : ''}
          ${e.sqft ? `<p><strong>Living Area:</strong> ${e.sqft.toLocaleString()} sqft</p>` : ''}
          ${e.lotAcres ? `<p><strong>Lot Size:</strong> ${e.lotAcres} acres</p>` : ''}
          ${e.yearBuilt ? `<p><strong>Year Built:</strong> ${e.yearBuilt}</p>` : ''}
          ${e.style ? `<p><strong>Style:</strong> ${e.style}</p>` : ''}
          ${e.heating || e.cooling ? `<p><strong>HVAC:</strong> ${[e.heating, e.cooling].filter(Boolean).join(' / ')}</p>` : ''}
          ${e.photoUrl ? `<p><a href="${e.photoUrl}" target="_blank" class="text-emerald-600 hover:underline">View Photo</a></p>` : ''}
        `;
      }
      
      detailPanel.innerHTML = detailHTML;
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