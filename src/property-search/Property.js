/**
 * @fileoverview Property Entity
 * @description Domain model for real estate property listings with validation.
 * @semantic validation, entity, real-estate
 * @intent Represents a validated property with required fields and business rules.
 * @dependencies neverthrow for error handling
 * @example
 * const property = Property.create({ address: '123 Main St', price: 250000, bedrooms: 3, bathrooms: 2 });
 * if (property.isOk()) { console.log(property.value.address); }
 */

const { ok, err } = require('neverthrow');
const Joi = require('joi');

const propertySchema = Joi.object({
  address: Joi.string().required(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  zipCode: Joi.string().optional(),
  price: Joi.number().positive().required(),
  bedrooms: Joi.number().min(0).optional(),
  bathrooms: Joi.number().min(0).optional(),
  metadata: Joi.object().optional()
});

/**
 * @class Property
 * @description Represents a real estate property with validation.
 * @semantic entity, validation, real-estate
 * @intent Encapsulates property data with business rules.
 * @dependencies Result for validation results
 */
class Property {
  /**
   * @constructor
   * @param {Object} props - Property properties.
   * @param {string} props.address - Property address.
   * @param {string} props.city - City.
   * @param {string} props.state - State.
   * @param {string} props.zipCode - ZIP code.
   * @param {number} props.price - Price.
   * @param {number} props.bedrooms - Number of bedrooms.
   * @param {number} props.bathrooms - Number of bathrooms.
   * @param {Object} [props.metadata] - Optional metadata.
   */
  constructor(props) {
    this.address = props.address;
    this.city = props.city;
    this.state = props.state;
    this.zipCode = props.zipCode;
    this.price = props.price;
    this.bedrooms = props.bedrooms;
    this.bathrooms = props.bathrooms;
    this.metadata = props.metadata || {}; // Optional extended data
  }

  /**
   * @static
   * @method create
   * @param {Object} props - Properties to create property from.
   * @returns {Result<Property>} Success with Property or failure with error.
   * @semantic validation
   * @intent Validates and creates a Property instance.
   */
  static create(props) {
    const { error, value } = propertySchema.validate(props);
    if (error) {
      return err(error.details[0].message);
    }

    return ok(new Property(value));
  }
}

module.exports = { Property };
