/**
 * Property Entity
 * 
 * Domain model for real estate property listings.
 * Validates required fields and business rules.
 */

class Result {
  constructor(isSuccess, value, error) {
    this.isSuccess = isSuccess;
    this._value = value;
    this.error = error;
  }

  getValue() {
    if (!this.isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this._value;
  }

  static ok(value) {
    return new Result(true, value, null);
  }

  static fail(error) {
    return new Result(false, null, error);
  }
}

class Property {
  constructor(props) {
    this.address = props.address;
    this.city = props.city;
    this.state = props.state;
    this.zipCode = props.zipCode;
    this.price = props.price;
    this.bedrooms = props.bedrooms;
    this.bathrooms = props.bathrooms;
  }

  static create(props) {
    // Validate required fields
    if (!props.address) {
      return Result.fail('Property address is required');
    }

    // Validate price
    if (props.price == null || props.price <= 0) {
      return Result.fail('Property price must be positive');
    }

    // Validate bedrooms
    if (props.bedrooms == null || props.bedrooms < 0) {
      return Result.fail('Property bedrooms must be non-negative');
    }

    // Validate bathrooms
    if (props.bathrooms == null || props.bathrooms < 0) {
      return Result.fail('Property bathrooms must be non-negative');
    }

    return Result.ok(new Property(props));
  }
}

module.exports = { Property, Result };
