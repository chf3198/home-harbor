/**
 * CT Real Estate Data Mapper Tests (RED)
 * Maps Connecticut open data schema to Property entity
 */

const { ctToProperty } = require('./ctDataMapper');
const { Property } = require('./Property');

describe('ctDataMapper', () => {
  describe('ctToProperty', () => {
    const validCtRow = {
      'Serial Number': '2020177',
      'List Year': '2020',
      'Date Recorded': '04/14/2021',
      Town: 'Ansonia',
      Address: '323 BEAVER ST',
      'Assessed Value': '133,000.00',
      'Sale Amount': '248,400.00',
      'Sales Ratio': '0.5354',
      'Property Type': 'Residential',
      'Residential Type': 'Single Family',
      'Non Use Code': '',
      'Assessor Remarks': '',
      'OPM remarks': '',
      Location: 'POINT (-73.06822 41.35014)',
    };

    it('should map CT row to Property entity successfully', () => {
      const result = ctToProperty(validCtRow);

      expect(result.isOk()).toBe(true);
      const property = result.value;
      expect(property.address).toBe('323 BEAVER ST, Ansonia');
      expect(property.city).toBe('Ansonia');
      expect(property.price).toBe(248400);
      expect(property.bedrooms).toBeUndefined(); // CT data doesn't have bedrooms
      expect(property.bathrooms).toBeUndefined(); // CT data doesn't have bathrooms
    });

    it('should add metadata fields from CT dataset', () => {
      const result = ctToProperty(validCtRow);

      const property = result.value;
      expect(property.metadata).toBeDefined();
      expect(property.metadata.propertyType).toBe('Residential');
      expect(property.metadata.residentialType).toBe('Single Family');
      expect(property.metadata.assessedValue).toBe(133000);
      expect(property.metadata.saleDate).toBe('04/14/2021');
      expect(property.metadata.listYear).toBe(2020);
    });

    it('should handle commercial properties', () => {
      const commercial = {
        ...validCtRow,
        'Property Type': 'Commercial',
        'Residential Type': '',
      };

      const result = ctToProperty(commercial);

      expect(result.isOk()).toBe(true);
      expect(result.value.metadata.propertyType).toBe('Commercial');
      expect(result.value.metadata.residentialType).toBe('');
    });

    it('should fail on missing required fields', () => {
      const invalid = { ...validCtRow, Address: '' };

      const result = ctToProperty(invalid);

      expect(result.isErr()).toBe(true);
      expect(result.error).toContain('Address is required');
    });

    it('should fail on invalid sale price', () => {
      const invalid = { ...validCtRow, 'Sale Amount': 'invalid' };

      const result = ctToProperty(invalid);

      expect(result.isErr()).toBe(true);
      expect(result.error).toContain('Sale Amount');
    });

    it('should handle missing optional metadata gracefully', () => {
      const minimal = {
        ...validCtRow,
        'Assessed Value': '',
        'Residential Type': '',
        Location: '',
      };

      const result = ctToProperty(minimal);

      expect(result.isOk()).toBe(true);
      expect(result.value.metadata.assessedValue).toBeUndefined();
      expect(result.value.metadata.residentialType).toBe('');
    });
  });
});
