import { useState } from 'react';
import { MapPin, Send } from 'lucide-react';
import LocationAutocomplete from '../ui/LocationAutocomplete';

interface MeetingSpotInputProps {
  onSubmit: (location: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function MeetingSpotInput({
  onSubmit,
  onCancel,
  placeholder = "Type a location or choose from suggestions...",
  disabled = false
}: MeetingSpotInputProps) {
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(location.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationSelect = (place: any) => {
    // Auto-submit when a location is selected from suggestions
    setLocation(place.structured_formatting.main_text);
    setTimeout(() => {
      onSubmit(place.structured_formatting.main_text);
    }, 100);
  };

  // Popular campus locations as quick buttons
  const quickLocations = [
    'Reitz Union',
    'Library West', 
    'Turlington Plaza',
    'Student Recreation Center',
    'Broward Dining'
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 max-w-md">
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="text-blue-500" size={20} />
          <h3 className="font-medium text-gray-900">Choose Meeting Location</h3>
        </div>
        <p className="text-sm text-gray-600">
          Where would you like to meet buyers? Start typing for suggestions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <LocationAutocomplete
          value={location}
          onChange={setLocation}
          onSelect={handleLocationSelect}
          placeholder={placeholder}
          disabled={disabled}
          className="text-sm"
        />

        {/* Quick Location Buttons */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium">Quick Select:</p>
          <div className="flex flex-wrap gap-2">
            {quickLocations.map((spot) => (
              <button
                key={spot}
                type="button"
                onClick={() => {
                  setLocation(spot);
                  onSubmit(spot);
                }}
                disabled={disabled || isSubmitting}
                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {spot}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={!location.trim() || disabled || isSubmitting}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Send size={14} />
                <span>Confirm Location</span>
              </>
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={disabled || isSubmitting}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-3 text-xs text-gray-500">
        💡 Tip: Choose a safe, public location on or near campus
      </div>
    </div>
  );
}