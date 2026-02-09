/**
 * @fileoverview Empty Results Component - Beautiful empty state with AI guidance
 */

import React from 'react';

function EmptyResults() {
  const suggestedQueries = [
    '🏠 "Find family homes in West Hartford"',
    '🏫 "Properties near good schools"',
    '💰 "Affordable homes under $300k"',
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center">
        <span className="text-3xl">💬</span>
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">Start with a conversation</h3>
      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        Ask our AI assistant what you're looking for. It'll search 211K+ Connecticut properties for you.
      </p>
      
      <div className="space-y-2 max-w-sm mx-auto">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Try asking:</p>
        {suggestedQueries.map((query, i) => (
          <div 
            key={i}
            className="text-left px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm shadow-sm"
          >
            {query}
          </div>
        ))}
      </div>
      
      <p className="mt-6 text-xs text-slate-500">
        Or use the <span className="font-medium">Advanced Filters</span> below the chat for manual search
      </p>
    </div>
  );
}

export default EmptyResults;