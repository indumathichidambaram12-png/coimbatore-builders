export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  locationName?: string;
}

export function getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Try to get a readable location name
        let locationName = 'Unknown Location';
        // Removed external API call for reverse geocoding due to deployment constraints.
        // locationName will default to 'Unknown Location'.
        // If a reverse geocoding service is required, it needs to be implemented
        // with a server-side proxy or a different approach that doesn't rely on direct client-side fetch to external APIs.

        resolve({
          latitude,
          longitude,
          accuracy,
          locationName
        });
      },
      (error) => {
        reject(new Error(`Location error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}
