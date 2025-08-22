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
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          locationName = data.locality || data.city || data.principalSubdivision || 'Unknown Location';
        } catch (error) {
          console.log('Could not fetch location name:', error);
        }

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
