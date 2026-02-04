/**
 * @fileoverview Pagination rendering utilities
 */

export function renderPagination(meta) {
  const paginationEl = document.getElementById('pagination');
  paginationEl.innerHTML = '';

  if (meta.totalPages <= 1) return;

  const prev = document.createElement('button');
  prev.textContent = 'Previous';
  prev.className = 'rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50';
  prev.disabled = !meta.hasPrevPage;
  prev.addEventListener('click', () => {
    const url = new URL(window.location);
    url.searchParams.set('page', meta.page - 1);
    window.location.href = url.toString();
  });

  const next = document.createElement('button');
  next.textContent = 'Next';
  next.className = 'rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50';
  next.disabled = !meta.hasNextPage;
  next.addEventListener('click', () => {
    const url = new URL(window.location);
    url.searchParams.set('page', meta.page + 1);
    window.location.href = url.toString();
  });

  const info = document.createElement('span');
  info.textContent = `Page ${meta.page} of ${meta.totalPages} (${meta.totalItems} total)`;
  info.className = 'text-sm text-slate-500';

  paginationEl.append(prev, info, next);
}