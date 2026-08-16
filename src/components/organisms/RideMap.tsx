import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { VeloraText } from '@components/atoms/VeloraText';
import { googleMapsApiKey } from '../../config/map';
import { useTheme } from '@hooks/useTheme';
import type { RideLocation } from '../../types/ride';

type LatLng = { latitude: number; longitude: number };

type Props = {
  pickup?: RideLocation | null;
  dropoff?: RideLocation | null;
  routeCoordinates?: LatLng[];
  /** Draw a straight line between pickup and dropoff when no route is loaded */
  showRoute?: boolean;
  showsUserLocation?: boolean;
  onMapPress?: (coordinate: LatLng) => void;
  fullBleed?: boolean;
  style?: object;
};

function buildRegion(pickup?: RideLocation | null, dropoff?: RideLocation | null): Region {
  const points: LatLng[] = [];
  if (pickup) points.push({ latitude: pickup.latitude, longitude: pickup.longitude });
  if (dropoff) points.push({ latitude: dropoff.latitude, longitude: dropoff.longitude });
  if (points.length === 0) {
    return {
      latitude: 33.6844,
      longitude: 73.0479,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }
  if (points.length === 1) {
    return {
      ...points[0],
      latitudeDelta: 0.04,
      longitudeDelta: 0.04,
    };
  }
  const lats = points.map(p => p.latitude);
  const lngs = points.map(p => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const pad = 0.15;
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(maxLat - minLat + pad, 0.04),
    longitudeDelta: Math.max(maxLng - minLng + pad, 0.04),
  };
}

export function RideMap({
  pickup,
  dropoff,
  routeCoordinates,
  showRoute = false,
  showsUserLocation = true,
  onMapPress,
  fullBleed = false,
  style,
}: Props) {
  const { theme } = useTheme();

  // Apple Maps on iOS works in Simulator without extra SDK setup; Google on Android.
  const provider = useMemo(() => {
    if (Platform.OS === 'android' && googleMapsApiKey) {
      return PROVIDER_GOOGLE;
    }
    return undefined;
  }, []);

  const region = useMemo(() => buildRegion(pickup, dropoff), [pickup, dropoff]);

  const lineCoordinates = useMemo(() => {
    if (routeCoordinates && routeCoordinates.length > 1) {
      return routeCoordinates;
    }
    if (showRoute && pickup && dropoff) {
      return [
        { latitude: pickup.latitude, longitude: pickup.longitude },
        { latitude: dropoff.latitude, longitude: dropoff.longitude },
      ];
    }
    return null;
  }, [routeCoordinates, showRoute, pickup, dropoff]);

  const mapKey = `${pickup?.latitude ?? 0}-${pickup?.longitude ?? 0}-${dropoff?.latitude ?? 0}-${dropoff?.longitude ?? 0}`;

  return (
    <View style={[styles.container, fullBleed && styles.fullBleed, style]}>
      <MapView
        key={mapKey}
        provider={provider}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={showsUserLocation}
        showsMyLocationButton={Platform.OS === 'android'}
        onPress={
          onMapPress
            ? e => {
                onMapPress(e.nativeEvent.coordinate);
              }
            : undefined
        }>
        {pickup ? (
          <Marker
            coordinate={{ latitude: pickup.latitude, longitude: pickup.longitude }}
            title="Pickup"
            pinColor={theme.colors.primary}
          />
        ) : null}
        {dropoff ? (
          <Marker
            coordinate={{ latitude: dropoff.latitude, longitude: dropoff.longitude }}
            title="Drop-off"
            pinColor="#C0392B"
          />
        ) : null}
        {lineCoordinates && lineCoordinates.length > 1 ? (
          <Polyline coordinates={lineCoordinates} strokeColor={theme.colors.primary} strokeWidth={4} />
        ) : null}
      </MapView>
      {onMapPress ? (
        <View style={styles.hint} pointerEvents="none">
          <VeloraText variant="caption" color={theme.colors.white}>
            Tap map to set drop-off
          </VeloraText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 240,
    borderRadius: 16,
    backgroundColor: '#E8DDD0',
  },
  fullBleed: {
    borderRadius: 0,
    minHeight: 280,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  hint: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
});
