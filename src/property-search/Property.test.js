/**
 * Property Entity Tests
 * 
 * Testing property validation rules:
 * - Required fields (address, price, bedrooms, bathrooms)
 * - Price must be positive
 * - Bedrooms/bathrooms must be non-negative integers
 * - City/state should be strings
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

      const property = Property.create(validData);

      expect(property.isSuccess).toBe(true);
      expect(property.getValue().address).toBe('123 Main St');
      expect(property.getValue().price).toBe(250000);
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

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('address');
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

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('price');
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

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('bedrooms');
    });
  });
});
