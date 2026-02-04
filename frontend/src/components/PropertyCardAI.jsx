import React from 'react';

function PropertyCardAI({ aiResponse, aiError }) {
  if (!aiResponse && !aiError) return null;

  return (
    <div className={`mt-3 rounded-xl border p-3 text-sm ${
      aiError
        ? 'border-red-100 bg-red-50 text-red-900'
        : 'border-emerald-100 bg-emerald-50 text-emerald-900'
    }`}>
      {aiError ? (
        <p>{aiError}</p>
      ) : (
        <div>
          <h4 className="font-medium mb-2">AI Analysis</h4>
          <div className="whitespace-pre-wrap">{aiResponse}</div>
        </div>
      )}
    </div>
  );
}

export default PropertyCardAI;