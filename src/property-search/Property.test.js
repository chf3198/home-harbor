/**
 * Property Entity Tests
 * 
 * Testing property validation rules using neverthrow Result pattern:
 * - Required fields (address, price)
 * - Price must be positive
 * - Bedrooms/bathrooms must be non-negative if provided
 */

const { Property } = require('./Property');

describe('Property Validation', () => {
  describe('Creating valid property', () => {
    test('creates property with all required fields', () => {
      const validData = {
        address: '123 Main St',
        city: 'Columbus',
        state: 'OH',
        zipCode: '43215',
        price: 250000,
        bedrooms: 3,
        bathrooms: 2
      };

      const result = Property.create(validData);

      expect(result.isOk()).toBe(true);
      expect(result.value.address).toBe('123 Main St');
      expect(result.value.price).toBe(250000);
    });

    test('creates property with minimal required fields', () => {
      const minimalData = {
        address: '456 Oak Ave',
        price: 300000
      };

      const result = Property.create(minimalData);

      expect(result.isOk()).toBe(true);
      expect(result.value.address).toBe('456 Oak Ave');
    });
  });

  describe('Validation failures', () => {
    test('fails without address', () => {
      const invalidData = {
        city: 'Columbus',
        price: 250000,
        bedrooms: 3,
        bathrooms: 2
      };

      const result = Property.create(invalidData);

      expect(result.isErr()).toBe(true);
      expect(result.error).toContain('address');
    });

    test('fails without price', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'Columbus',
        bedrooms: 3,
        bathrooms: 2
      };

      const result = Property.create(invalidData);

      expect(result.isErr()).toBe(true);
      expect(result.error).toContain('price');
    });

    test('fails with negative price', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'Columbus',
        price: -100,
        bedrooms: 3,
        bathrooms: 2
      };

      const result = Property.create(invalidData);

      expect(result.isErr()).toBe(true);
      expect(result.error).toContain('positive');
    });

    test('fails with zero price', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'Columbus',
        price: 0,
        bedrooms: 3,
        bathrooms: 2
      };

      const result = Property.create(invalidData);

      expect(result.isErr()).toBe(true);
      expect(result.error).toContain('positive');
    });

    test('fails with negative bedrooms', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'Columbus',
        price: 250000,
        bedrooms: -1,
        bathrooms: 2
      };

      const result = Property.create(invalidData);

      expect(result.isErr()).toBe(true);
    });

    test('fails with negative bathrooms', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'Columbus',
        price: 250000,
        bedrooms: 3,
        bathrooms: -1
      };

      const result = Property.create(invalidData);

      expect(result.isErr()).toBe(true);
    });
  });
});
