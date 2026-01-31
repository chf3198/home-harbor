/**
 * Paginator
 * 
 * Pure function for paginating large result sets
 */

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 10;

/**
 * Paginate data array
 * @param {Array} data - Array to paginate
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (1-indexed)
 * @param {number} options.pageSize - Items per page
 * @returns {Object} Paginated result with metadata
 */
function paginate(data, options = {}) {
  if (!data) {
    throw new Error('Data array is required');
  }

  const page = options.page !== undefined ? options.page : 1;
  const requestedPageSize = options.pageSize !== undefined ? options.pageSize : DEFAULT_PAGE_SIZE;

  // Validation
  if (page < 1) {
    throw new Error('Page number must be >= 1');
  }

  if (requestedPageSize < 1) {
    throw new Error('Page size must be >= 1');
  }

  // Enforce maximum page size
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);

  // Calculate pagination
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Extract page data
  const pageData = data.slice(startIndex, endIndex);

  return {
    data: pageData,
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

module.exports = { paginate };
