import React from 'react';

function PropertyCardDetails({ details, detailsError, detailsLoading }) {
  if (!details && !detailsError && !detailsLoading) return null;

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
      {detailsError ? (
        <p className="text-red-600">{detailsError}</p>
      ) : details ? (
        <div className="space-y-1">
          <p><strong>Address:</strong> {details.address}</p>
          <p><strong>Sale Date:</strong> {details.metadata?.saleDate || 'N/A'}</p>
          <p><strong>Residential Type:</strong> {details.metadata?.residentialType || 'N/A'}</p>
          <p><strong>Serial Number:</strong> {details.metadata?.serialNumber || 'N/A'}</p>
        </div>
      ) : (
        <p>Loading details...</p>
      )}
    </div>
  );
}

export default PropertyCardDetails;