import { GOOGLE_MAPS_API_KEY } from '@env';
import type { RideLocation } from '../types/ride';

export type NearbyPlace = RideLocation & { placeId?: string };

type GoogleLatLng = { lat: number; lng: number };

type NearbySearchResult = {
  place_id?: string;
  name?: string;
  vicinity?: string;
  geometry?: { location?: GoogleLatLng };
};

type NearbySearchResponse = {
  status: string;
  error_message?: string;
  results?: NearbySearchResult[];
};

type GeocodeResponse = {
  status: string;
  error_message?: string;
  results?: Array<{ formatted_address?: string }>;
};

type AutocompletePrediction = {
  place_id?: string;
  description?: string;
  structured_formatting?: { main_text?: string; secondary_text?: string };
};

type AutocompleteResponse = {
  status: string;
  error_message?: string;
  predictions?: AutocompletePrediction[];
};

type PlaceDetailsResponse = {
  status: string;
  error_message?: string;
  result?: {
    place_id?: string;
    name?: string;
    formatted_address?: string;
    geometry?: { location?: GoogleLatLng };
  };
};

type TextSearchResponse = {
  status: string;
  error_message?: string;
  results?: NearbySearchResult[];
};

const NEARBY_TYPES = [
  'shopping_mall',
  'hospital',
  'airport',
  'train_station',
  'bus_station',
  'university',
  'tourist_attraction',
  'restaurant',
  'supermarket',
] as const;

function hasMapsKey(): boolean {
  return Boolean(GOOGLE_MAPS_API_KEY?.trim());
}

function mapNearbyResult(place: NearbySearchResult): NearbyPlace | null {
  if (!place.geometry?.location) return null;
  const { lat, lng } = place.geometry.location;
  const label = place.vicinity ? `${place.name}, ${place.vicinity}` : place.name ?? 'Nearby place';
  return {
    address: label,
    latitude: lat,
    longitude: lng,
    placeId: place.place_id,
  };
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  if (!hasMapsKey()) return null;

  const url =
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}` +
    `&key=${GOOGLE_MAPS_API_KEY}&language=en&region=pk`;

  const response = await fetch(url);
  const json = (await response.json()) as GeocodeResponse;

  if (json.status !== 'OK' || !json.results?.length) {
    return null;
  }

  return json.results[0].formatted_address ?? null;
}

export async function fetchNearbyPlaces(
  latitude: number,
  longitude: number,
  radiusMeters = 12000,
): Promise<NearbyPlace[]> {
  if (!hasMapsKey()) return [];

  const url =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}` +
    `&radius=${radiusMeters}&key=${GOOGLE_MAPS_API_KEY}&language=en`;

  const response = await fetch(url);
  const json = (await response.json()) as NearbySearchResponse;

  if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
    throw new Error(json.error_message || `Places API: ${json.status}`);
  }

  return (json.results ?? [])
    .map(mapNearbyResult)
    .filter((p): p is NearbyPlace => p !== null)
    .slice(0, 15);
}

export async function fetchNearbyPlacesByTypes(
  latitude: number,
  longitude: number,
  radiusMeters = 10000,
): Promise<NearbyPlace[]> {
  if (!hasMapsKey()) return [];

  const batches = await Promise.all(
    NEARBY_TYPES.map(async type => {
      const url =
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}` +
        `&radius=${radiusMeters}&type=${type}&key=${GOOGLE_MAPS_API_KEY}&language=en`;
      const response = await fetch(url);
      const json = (await response.json()) as NearbySearchResponse;
      if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') return [];
      return (json.results ?? []).map(mapNearbyResult).filter((p): p is NearbyPlace => p !== null);
    }),
  );

  const merged: NearbyPlace[] = [];
  const seen = new Set<string>();

  for (const batch of batches) {
    for (const place of batch) {
      const key = place.placeId ?? `${place.latitude.toFixed(4)},${place.longitude.toFixed(4)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(place);
    }
  }

  return merged.slice(0, 40);
}

export async function searchPlaceAutocomplete(
  query: string,
  latitude: number,
  longitude: number,
): Promise<NearbyPlace[]> {
  if (!hasMapsKey() || query.trim().length < 2) return [];

  const url =
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}` +
    `&location=${latitude},${longitude}&radius=80000&components=country:pk` +
    `&key=${GOOGLE_MAPS_API_KEY}&language=en`;

  const response = await fetch(url);
  const json = (await response.json()) as AutocompleteResponse;

  if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
    throw new Error(json.error_message || `Autocomplete: ${json.status}`);
  }

  const predictions = json.predictions ?? [];
  const withCoords = await Promise.all(
    predictions.slice(0, 8).map(async prediction => {
      if (!prediction.place_id) return null;
      const details = await fetchPlaceDetails(prediction.place_id);
      if (!details) return null;
      return {
        address: prediction.description ?? details.address,
        latitude: details.latitude,
        longitude: details.longitude,
        placeId: prediction.place_id,
      };
    }),
  );

  return withCoords.filter((p): p is NearbyPlace => p !== null);
}

export async function searchPlacesText(
  query: string,
  latitude: number,
  longitude: number,
): Promise<NearbyPlace[]> {
  if (!hasMapsKey() || query.trim().length < 2) return [];

  const url =
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}` +
    `&location=${latitude},${longitude}&radius=100000&region=pk` +
    `&key=${GOOGLE_MAPS_API_KEY}&language=en`;

  const response = await fetch(url);
  const json = (await response.json()) as TextSearchResponse;

  if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
    return [];
  }

  return (json.results ?? [])
    .map(mapNearbyResult)
    .filter((p): p is NearbyPlace => p !== null)
    .slice(0, 10);
}

export async function fetchPlaceDetails(placeId: string): Promise<NearbyPlace | null> {
  if (!hasMapsKey()) return null;

  const url =
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}` +
    `&fields=place_id,name,formatted_address,geometry&key=${GOOGLE_MAPS_API_KEY}&language=en`;

  const response = await fetch(url);
  const json = (await response.json()) as PlaceDetailsResponse;

  if (json.status !== 'OK' || !json.result?.geometry?.location) {
    return null;
  }

  const { lat, lng } = json.result.geometry.location;
  return {
    address: json.result.formatted_address ?? json.result.name ?? 'Selected place',
    latitude: lat,
    longitude: lng,
    placeId: json.result.place_id ?? placeId,
  };
}
