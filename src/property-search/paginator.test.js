/**
 * Pagination Tests (RED)
 * Paginate large result sets for API responses
 */

const { paginate } = require('./paginator');

describe('paginator', () => {
  const sampleProperties = Array.from({ length: 100 }, (_, i) => ({
    address: `${i + 1} Main St`,
    city: 'Ansonia',
    price: (i + 1) * 10000,
  }));

  describe('paginate', () => {
    it('should return first page of 10 items by default', () => {
      const result = paginate(sampleProperties);

      expect(result.data.length).toBe(10);
      expect(result.data[0].address).toBe('1 Main St');
      expect(result.data[9].address).toBe('10 Main St');
    });

    it('should return correct page with custom page size', () => {
      const result = paginate(sampleProperties, { page: 1, pageSize: 25 });

      expect(result.data.length).toBe(25);
      expect(result.data[0].address).toBe('1 Main St');
    });

    it('should return second page correctly', () => {
      const result = paginate(sampleProperties, { page: 2, pageSize: 10 });

      expect(result.data.length).toBe(10);
      expect(result.data[0].address).toBe('11 Main St');
      expect(result.data[9].address).toBe('20 Main St');
    });

    it('should return partial last page', () => {
      const result = paginate(sampleProperties, { page: 10, pageSize: 11 });

      expect(result.data.length).toBe(1); // 11*9 = 99, only 1 left
      expect(result.data[0].address).toBe('100 Main St');
    });

    it('should include pagination metadata', () => {
      const result = paginate(sampleProperties, { page: 3, pageSize: 20 });

      expect(result.page).toBe(3);
      expect(result.pageSize).toBe(20);
      expect(result.totalItems).toBe(100);
      expect(result.totalPages).toBe(5);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPrevPage).toBe(true);
    });

    it('should indicate first page correctly', () => {
      const result = paginate(sampleProperties, { page: 1, pageSize: 10 });

      expect(result.hasPrevPage).toBe(false);
      expect(result.hasNextPage).toBe(true);
    });

    it('should indicate last page correctly', () => {
      const result = paginate(sampleProperties, { page: 10, pageSize: 10 });

      expect(result.hasPrevPage).toBe(true);
      expect(result.hasNextPage).toBe(false);
    });

    it('should handle empty array', () => {
      const result = paginate([]);

      expect(result.data.length).toBe(0);
      expect(result.totalItems).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPrevPage).toBe(false);
    });

    it('should handle page beyond total pages', () => {
      const result = paginate(sampleProperties, { page: 999, pageSize: 10 });

      expect(result.data.length).toBe(0);
      expect(result.page).toBe(999);
    });

    it('should throw on null data', () => {
      expect(() => paginate(null)).toThrow();
    });

    it('should throw on invalid page number', () => {
      expect(() => paginate(sampleProperties, { page: 0 })).toThrow();
      expect(() => paginate(sampleProperties, { page: -1 })).toThrow();
    });

    it('should throw on invalid page size', () => {
      expect(() => paginate(sampleProperties, { pageSize: 0 })).toThrow();
      expect(() => paginate(sampleProperties, { pageSize: -10 })).toThrow();
    });

    it('should enforce maximum page size', () => {
      const result = paginate(sampleProperties, { page: 1, pageSize: 1000 });

      // Max page size should be 100
      expect(result.pageSize).toBe(100);
      expect(result.data.length).toBe(100);
    });
  });
});
