/**
 * @fileoverview Custom hook for loading property details
 */

import { useState } from 'react';

export function usePropertyDetails(propertyId) {
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  const loadPropertyDetails = async () => {
    if (details) return; // Already loaded

    setDetailsLoading(true);
    setDetailsError(null);

    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      if (!response.ok) {
        throw new Error('Failed to load property details');
      }
      const data = await response.json();
      setDetails(data);
    } catch (error) {
      setDetailsError(error.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  return {
    details,
    detailsLoading,
    detailsError,
    loadPropertyDetails,
  };
}