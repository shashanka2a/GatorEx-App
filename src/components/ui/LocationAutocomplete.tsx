import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Clock, Star } from 'lucide-react';

interface LocationSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
  distance_meters?: number;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (place: LocationSuggestion) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  campusLocation?: {
    lat: number;
    lng: number;
    radius?: number;
  };
}

// University of Florida campus coordinates
const UF_CAMPUS = {
  lat: 29.6436,
  lng: -82.3549,
  radius: 5000 // 5km radius around campus
};

// Popular campus locations as fallback
const POPULAR_LOCATIONS = [
  {
    place_id: 'reitz_union',
    description: 'Reitz Union, University of Florida',
    structured_formatting: {
      main_text: 'Reitz Union',
      secondary_text: 'University of Florida, Gainesville, FL'
    },
    types: ['university', 'establishment']
  },
  {
    place_id: 'library_west',
    description: 'Library West, University of Florida',
    structured_formatting: {
      main_text: 'Library West',
      secondary_text: 'University of Florida, Gainesville, FL'
    },
    types: ['library', 'establishment']
  },
  {
    place_id: 'turlington_plaza',
    description: 'Turlington Plaza, University of Florida',
    structured_formatting: {
      main_text: 'Turlington Plaza',
      secondary_text: 'University of Florida, Gainesville, FL'
    },
    types: ['university', 'establishment']
  },
  {
    place_id: 'student_rec',
    description: 'Student Recreation Center, University of Florida',
    structured_formatting: {
      main_text: 'Student Recreation Center',
      secondary_text: 'University of Florida, Gainesville, FL'
    },
    types: ['gym', 'establishment']
  },
  {
    place_id: 'broward_dining',
    description: 'Broward Dining, University of Florida',
    structured_formatting: {
      main_text: 'Broward Dining',
      secondary_text: 'University of Florida, Gainesville, FL'
    },
    types: ['restaurant', 'establishment']
  }
];

export default function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Enter meeting location...",
  className = "",
  disabled = false,
  campusLocation = UF_CAMPUS
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentLocations, setRecentLocations] = useState<LocationSuggestion[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();


  // Load recent locations from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gatorex_recent_locations');
      if (saved) {
        setRecentLocations(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recent locations:', error);
    }
  }, []);

  // Save recent location
  const saveRecentLocation = useCallback((location: LocationSuggestion) => {
    try {
      const updated = [
        location,
        ...recentLocations.filter(loc => loc.place_id !== location.place_id)
      ].slice(0, 5); // Keep only 5 recent locations
      
      setRecentLocations(updated);
      localStorage.setItem('gatorex_recent_locations', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent location:', error);
    }
  }, [recentLocations]);

  // Fetch suggestions from Google Places API
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/places/autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: query,
          location: `${campusLocation.lat},${campusLocation.lng}`,
          radius: campusLocation.radius,
          types: 'establishment|university|library|restaurant|store',
          components: 'country:us'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.predictions || []);
      } else {
        // Fallback to popular locations if API fails
        const filtered = POPULAR_LOCATIONS.filter(loc =>
          loc.description.toLowerCase().includes(query.toLowerCase())
        );
        setSuggestions(filtered);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      // Fallback to popular locations
      const filtered = POPULAR_LOCATIONS.filter(loc =>
        loc.description.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } finally {
      setIsLoading(false);
    }
  }, [campusLocation]);

  // Debounced search
  const debouncedSearch = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
  }, [fetchSuggestions]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);
    
    if (newValue.trim()) {
      debouncedSearch(newValue);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    onChange(suggestion.structured_formatting.main_text);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    saveRecentLocation(suggestion);
    onSelect?.(suggestion);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (value.trim()) {
      debouncedSearch(value);
    } else if (recentLocations.length > 0) {
      setSuggestions(recentLocations);
    } else {
      setSuggestions(POPULAR_LOCATIONS);
    }
    setShowSuggestions(true);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get icon for location type
  const getLocationIcon = (types: string[]) => {
    if (types.includes('university') || types.includes('school')) {
      return '🎓';
    } else if (types.includes('library')) {
      return '📚';
    } else if (types.includes('restaurant') || types.includes('food')) {
      return '🍽️';
    } else if (types.includes('store') || types.includes('shopping_mall')) {
      return '🛍️';
    } else if (types.includes('gym') || types.includes('health')) {
      return '💪';
    } else if (types.includes('park')) {
      return '🌳';
    } else {
      return '📍';
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          } ${className}`}
        />
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || recentLocations.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {/* Recent Locations */}
          {!value.trim() && recentLocations.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>Recent Locations</span>
                </div>
              </div>
              {recentLocations.map((suggestion, index) => (
                <button
                  key={`recent-${suggestion.place_id}`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                    selectedIndex === index ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg mt-0.5">
                      {getLocationIcon(suggestion.types)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {suggestion.structured_formatting.main_text}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {suggestion.structured_formatting.secondary_text}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Popular/Search Results */}
          {suggestions.length > 0 && (
            <>
              {!value.trim() && recentLocations.length > 0 && (
                <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                  <div className="flex items-center space-x-1">
                    <Star size={12} />
                    <span>Popular Locations</span>
                  </div>
                </div>
              )}
              
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.place_id}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                    selectedIndex === index ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg mt-0.5">
                      {getLocationIcon(suggestion.types)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {suggestion.structured_formatting.main_text}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {suggestion.structured_formatting.secondary_text}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* No results */}
          {value.trim() && suggestions.length === 0 && !isLoading && (
            <div className="px-4 py-6 text-center text-gray-500">
              <MapPin className="mx-auto mb-2 text-gray-300" size={24} />
              <p className="text-sm">No locations found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}