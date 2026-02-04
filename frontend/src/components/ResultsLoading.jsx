import React from 'react';
import LoadingSpinner from './LoadingSpinner';

function ResultsLoading() {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
        <span className="ml-3 text-slate-600">Searching properties...</span>
      </div>
    </section>
  );
}

export default ResultsLoading;