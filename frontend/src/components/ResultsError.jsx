import React from 'react';

function ResultsError({ error }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
        <strong>Error:</strong> {error}
      </div>
    </section>
  );
}

export default ResultsError;