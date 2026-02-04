/**
 * @fileoverview AI Chat Response Component
 */

import React from 'react';

function AIChatResponse({ response, error, loading }) {
  return (
    <div className="mt-4">
      {error && (
        <div
          className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && !error && (
        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          <div className="whitespace-pre-wrap">{response}</div>
        </div>
      )}

      {!response && !error && !loading && (
        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 italic">
          AI responses will appear here. Try asking about Connecticut real estate or search tips!
        </div>
      )}
    </div>
  );
}

export default AIChatResponse;