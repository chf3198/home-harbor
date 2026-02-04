import React from 'react';

function PropertyCardActions({ onToggleExpansion, onAnalyze, isExpanded, isAnalyzing, detailsLoading }) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      <button
        onClick={onToggleExpansion}
        className="btn-secondary text-xs"
        disabled={detailsLoading}
      >
        {detailsLoading ? 'Loading...' : isExpanded ? 'Hide details' : 'View details'}
      </button>

      <button
        onClick={() => onAnalyze('vision')}
        disabled={isAnalyzing}
        className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze photo'}
      </button>

      <button
        onClick={() => onAnalyze('description')}
        disabled={isAnalyzing}
        className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? 'Generating...' : 'Generate description'}
      </button>
    </div>
  );
}

export default PropertyCardActions;