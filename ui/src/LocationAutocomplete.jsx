import { useEffect, useRef, useState } from 'react';
import './LocationAutocomplete.css';

export default function LocationAutocomplete({ value, onChange, onLocationSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Continue without location - search will still work
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }
  }, []);

  const searchLocation = async (query, currentUserLocation) => {
    if (!query || query.trim().length < 1) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Build URL with location bias to prioritize nearby results
      const locationToUse = currentUserLocation || userLocation;
      let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1`;
      
      // Add location bias if available (but don't restrict with bounded=1)
      if (locationToUse) {
        // Use viewbox for bias - larger area to ensure results but still prioritize nearby
        url += `&lat=${locationToUse.lat}&lon=${locationToUse.lon}&viewbox=${locationToUse.lon - 0.5},${locationToUse.lat - 0.5},${locationToUse.lon + 0.5},${locationToUse.lat + 0.5}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'DrywallRobotApp/1.0',
        },
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      let data = await response.json();
      
      // Sort results by distance if we have user location (for prioritization)
      if (locationToUse && data.length > 0) {
        data.sort((a, b) => {
          const distA = getDistance(
            locationToUse.lat,
            locationToUse.lon,
            parseFloat(a.lat),
            parseFloat(a.lon)
          );
          const distB = getDistance(
            locationToUse.lat,
            locationToUse.lon,
            parseFloat(b.lat),
            parseFloat(b.lon)
          );
          return distA - distB;
        });
      }
      
      // Take top 5 results
      setSuggestions(data.slice(0, 5));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Location search error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Debounce API calls
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Search immediately if there's text, otherwise clear suggestions
    if (newValue.trim().length >= 1) {
      timeoutRef.current = setTimeout(() => {
        // Pass current userLocation to ensure we use the latest value
        searchLocation(newValue, userLocation);
      }, 250); // Reduced debounce for faster response
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (suggestion) => {
    const displayName = suggestion.display_name;
    onChange(displayName);
    setShowSuggestions(false);
    setSuggestions([]);

    // Call callback with location data
    if (onLocationSelect) {
      onLocationSelect({
        address: displayName,
        latitude: parseFloat(suggestion.lat),
        longitude: parseFloat(suggestion.lon),
      });
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => setShowSuggestions(false), 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="location-autocomplete">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          } else if (value.trim().length >= 1) {
            // If there's text but no suggestions, trigger a search
            searchLocation(value, userLocation);
            setShowSuggestions(true);
          }
        }}
        onBlur={handleBlur}
        placeholder="Start typing an address..."
        className="location-input"
      />
      {loading && <div className="location-loading">Searching...</div>}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="location-suggestions">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="location-suggestion-item"
              onClick={() => handleSelect(suggestion)}
            >
              <div className="suggestion-name">{suggestion.display_name}</div>
              <div className="suggestion-details">
                {suggestion.address && (
                  <>
                    {suggestion.address.city || suggestion.address.town || ''}
                    {suggestion.address.state && `, ${suggestion.address.state}`}
                  </>
                )}
                {userLocation && (
                  <span className="suggestion-distance">
                    {' • '}
                    {getDistance(
                      userLocation.lat,
                      userLocation.lon,
                      parseFloat(suggestion.lat),
                      parseFloat(suggestion.lon)
                    ).toFixed(1)} km away
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

