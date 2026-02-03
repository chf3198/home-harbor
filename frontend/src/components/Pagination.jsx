import React from 'react';

function Pagination({ currentPage, totalPages, totalItems, onPageChange }) {
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const handlePrevPage = () => {
    if (hasPrevPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
      <button
        onClick={handlePrevPage}
        disabled={!hasPrevPage}
        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        ← Previous
      </button>

      <span className="text-sm text-slate-600">
        Page {currentPage} of {totalPages} ({totalItems} results)
      </span>

      <button
        onClick={handleNextPage}
        disabled={!hasNextPage}
        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        Next →
      </button>
    </div>
  );
}

export default Pagination;