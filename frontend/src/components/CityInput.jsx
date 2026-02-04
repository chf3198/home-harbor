import React, { useState, useEffect } from 'react';

function CityInput({ value, onChange, onSelect }) {
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load city data
  useEffect(() => {
    fetch('/cities.json')
      .then(response => response.json())
      .then(data => setCitySuggestions(data.cities || []))
      .catch(error => console.error('Failed to load cities:', error));
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (newValue.length > 0) {
      // Filter cities based on input
      const matches = citySuggestions
        .filter(city => city.toLowerCase().includes(newValue.toLowerCase()))
        .slice(0, 5);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleCitySelect = (city) => {
    onSelect(city);
    setShowSuggestions(false);
  };

  const filteredSuggestions = citySuggestions
    .filter(city => city.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 5);

  return (
    <div className="relative">
      <label htmlFor="city" className="block text-sm font-medium text-slate-600">
        City
      </label>
      <input
        type="text"
        id="city"
        name="city"
        value={value}
        onChange={handleInputChange}
        className="input-field"
        placeholder="Enter city name"
        autoComplete="off"
      />
      {showSuggestions && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
          {filteredSuggestions.map((city, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleCitySelect(city)}
              className="w-full px-3 py-2 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CityInput;