/**
 * @fileoverview Property card creation utilities
 */

import { createCardElements } from './cardElements.js';
import { setupCardEvents } from './cardEvents.js';

export function createPropertyCard(property, aiReady) {
  const elements = createCardElements(property);
  const {
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
  } = elements;

  setupCardEvents(elements, property, aiReady);

  card.append(title, price, details, realtorLink, assessed, detailButton, detailPanel, visionButton, descriptionButton, aiPanel);
  return card;
}