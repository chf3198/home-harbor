/**
 * @fileoverview RAG Chat UI Components
 * @description Presentational components for RAG chat interface
 * @semantic rag, ui, components
 */

import React from 'react';

export function RAGStatusBadge({ isReady, isIndexing }) {
  if (isIndexing) {
    return (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">
        Indexing...
      </span>
    );
  }
  if (isReady) {
    return (
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
        RAG Ready
      </span>
    );
  }
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
      Loading...
    </span>
  );
}

export function IndexingProgress({ progress }) {
  const percent =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
  return (
    <div className="mb-4">
      <div className="h-2 rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Indexing {progress.current}/{progress.total} properties
      </p>
    </div>
  );
}

export function ErrorDisplay({ message }) {
  return <div className="rounded-lg bg-red-50 p-4 text-red-700">{message}</div>;
}

export function SourcesList({ sources }) {
  if (!sources?.length) return null;
  return (
    <div className="text-sm">
      <p className="font-medium text-slate-600 mb-2">Sources:</p>
      <ul className="space-y-1">
        {sources.map((s) => (
          <li key={s.id} className="text-slate-500">
            • {s.address}, {s.city}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResponseDisplay({ response, sources }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-slate-50 p-4">
        <p className="text-slate-800 whitespace-pre-wrap">{response}</p>
      </div>
      <SourcesList sources={sources} />
    </div>
  );
}
