/**
 * @fileoverview Property Entity
 * @description Domain model for real estate property listings with validation.
 * @semantic validation, entity, real-estate
 * @intent Represents a validated property with required fields and business rules.
 * @dependencies Result class for error handling
 * @example
 * const property = Property.create({ address: '123 Main St', price: 250000, bedrooms: 3, bathrooms: 2 });
 * if (property.isSuccess) { console.log(property.getValue().address); }
 */

/**
 * @class Result
 * @description Custom result type for success/failure handling, avoiding exceptions for validation.
 * @semantic error-handling, monad
 * @intent Provides a functional way to handle operations that may fail.
 */
class Result {
  /**
   * @constructor
   * @param {boolean} isSuccess - Whether the operation succeeded.
   * @param {*} value - The success value.
   * @param {string} error - The error message.
   */
  constructor(isSuccess, value, error) {
    this.isSuccess = isSuccess;
    this._value = value;
    this.error = error;
  }

  /**
   * @getter
   * @returns {*} The value if successful.
   */
  get value() {
    return this._value;
  }

  /**
   * @method getValue
   * @returns {*} The value, throws if failed.
   * @throws {Error} If result is failure.
   */
  getValue() {
    if (!this.isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this._value;
  }

  /**
   * @static
   * @method ok
   * @param {*} value - The success value.
   * @returns {Result} A success result.
   */
  static ok(value) {
    return new Result(true, value, null);
  }

  /**
   * @static
   * @method fail
   * @param {string} error - The error message.
   * @returns {Result} A failure result.
   */
  static fail(error) {
    return new Result(false, null, error);
  }
}

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
    // Validate required fields
    if (!props.address) {
      return Result.fail('Property address is required');
    }

    // Validate price
    if (props.price == null || props.price <= 0) {
      return Result.fail('Property price must be positive');
    }

    // Bedrooms/bathrooms optional for CT data (not in schema)
    if (props.bedrooms !== undefined && props.bedrooms < 0) {
      return Result.fail('Property bedrooms must be non-negative');
    }

    if (props.bathrooms !== undefined && props.bathrooms < 0) {
      return Result.fail('Property bathrooms must be non-negative');
    }

    return Result.ok(new Property(props));
  }
}

module.exports = { Property, Result };
