import { useState } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { getCurrentLocation, LocationData } from '@/react-app/utils/location';

interface LocationButtonProps {
  onLocationCapture: (location: LocationData) => void;
  disabled?: boolean;
  className?: string;
}

export default function LocationButton({ onLocationCapture, disabled, className = '' }: LocationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCaptureLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const location = await getCurrentLocation();
      onLocationCapture(location);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      console.error('Location error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleCaptureLocation}
        disabled={disabled || loading}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
          loading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
        }`}
      >
        {loading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <MapPin className="w-4 h-4" />
        )}
        {loading ? 'Getting Location...' : 'Capture Location'}
      </button>
      
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
