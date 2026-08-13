import { useEffect, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import type { RideLocation } from '../types/ride';
import { normalizePickupLocation } from '../utils/locations';
import { reverseGeocode } from '../services/placesService';

export function useUserLocation() {
  const [location, setLocation] = useState<RideLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Geolocation.requestAuthorization();
    Geolocation.getCurrentPosition(
      position => {
        const normalized = normalizePickupLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: 'Current location',
        });
        setLocation(normalized);
        setLoading(false);

        reverseGeocode(normalized.latitude, normalized.longitude)
          .then(address => {
            if (address) {
              setLocation(prev =>
                prev
                  ? { ...prev, address }
                  : { latitude: normalized.latitude, longitude: normalized.longitude, address },
              );
            }
          })
          .catch(() => {});
      },
      () => {
        const fallback = normalizePickupLocation({
          latitude: 33.6844,
          longitude: 73.0479,
          address: 'Islamabad City Center',
        });
        setLocation(fallback);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }, []);

  return { location, loading };
}
