/**
 * Property Type Filter Tests (RED)
 * Filters properties by property type (Residential, Commercial, etc.)
 * and residential subtype (Single Family, Condo, etc.)
 */

const { filterByPropertyType, filterByResidentialType } = require('./typeFilter');

describe('typeFilter', () => {
  const sampleProperties = [
    {
      address: '123 Main St, Ansonia',
      city: 'Ansonia',
      state: 'CT',
      price: 248400,
      metadata: { propertyType: 'Residential', residentialType: 'Single Family' },
    },
    {
      address: '456 Oak Ave, Avon',
      city: 'Avon',
      state: 'CT',
      price: 362500,
      metadata: { propertyType: 'Residential', residentialType: 'Condo' },
    },
    {
      address: '789 Commerce Dr, Berlin',
      city: 'Berlin',
      state: 'CT',
      price: 550000,
      metadata: { propertyType: 'Commercial', residentialType: '' },
    },
    {
      address: '321 Elm St, Bethel',
      city: 'Bethel',
      state: 'CT',
      price: 275000,
      metadata: { propertyType: 'Residential', residentialType: 'Two Family' },
    },
  ];

  describe('filterByPropertyType', () => {
    it('should filter residential properties', () => {
      const result = filterByPropertyType(sampleProperties, 'Residential');

      expect(result.length).toBe(3);
      expect(result.every((p) => p.metadata.propertyType === 'Residential')).toBe(true);
    });

    it('should filter commercial properties', () => {
      const result = filterByPropertyType(sampleProperties, 'Commercial');

      expect(result.length).toBe(1);
      expect(result[0].city).toBe('Berlin');
    });

    it('should be case-insensitive', () => {
      const result = filterByPropertyType(sampleProperties, 'residential');

      expect(result.length).toBe(3);
    });

    it('should return empty array for no matches', () => {
      const result = filterByPropertyType(sampleProperties, 'Industrial');

      expect(result.length).toBe(0);
    });

    it('should return all properties when propertyType is empty', () => {
      const result = filterByPropertyType(sampleProperties, '');

      expect(result.length).toBe(4);
    });

    it('should throw on null properties', () => {
      expect(() => filterByPropertyType(null, 'Residential')).toThrow();
    });
  });

  describe('filterByResidentialType', () => {
    it('should filter single family homes', () => {
      const result = filterByResidentialType(sampleProperties, 'Single Family');

      expect(result.length).toBe(1);
      expect(result[0].city).toBe('Ansonia');
    });

    it('should filter condos', () => {
      const result = filterByResidentialType(sampleProperties, 'Condo');

      expect(result.length).toBe(1);
      expect(result[0].city).toBe('Avon');
    });

    it('should filter multi-family properties', () => {
      const result = filterByResidentialType(sampleProperties, 'Two Family');

      expect(result.length).toBe(1);
      expect(result[0].city).toBe('Bethel');
    });

    it('should be case-insensitive', () => {
      const result = filterByResidentialType(sampleProperties, 'single family');

      expect(result.length).toBe(1);
    });

    it('should return empty array for no matches', () => {
      const result = filterByResidentialType(sampleProperties, 'Three Family');

      expect(result.length).toBe(0);
    });

    it('should return all properties when residentialType is empty', () => {
      const result = filterByResidentialType(sampleProperties, '');

      expect(result.length).toBe(4);
    });

    it('should handle commercial properties gracefully', () => {
      const result = filterByResidentialType(sampleProperties, 'Single Family');

      // Should only return residential single family, not commercial
      expect(result.every((p) => p.metadata.residentialType === 'Single Family')).toBe(true);
    });
  });
});
