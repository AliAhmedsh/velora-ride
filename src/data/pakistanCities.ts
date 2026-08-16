import type { RideLocation } from '../types/ride';

export type PakistanCity = {
  name: string;
  province: string;
  latitude: number;
  longitude: number;
};

/** Major cities across Pakistan for City-to-City booking. */
export const PAKISTAN_CITY_LIST: PakistanCity[] = [
  { name: 'Islamabad', province: 'ICT', latitude: 33.6844, longitude: 73.0479 },
  { name: 'Rawalpindi', province: 'Punjab', latitude: 33.5973, longitude: 73.0479 },
  { name: 'Lahore', province: 'Punjab', latitude: 31.5204, longitude: 74.3587 },
  { name: 'Karachi', province: 'Sindh', latitude: 24.8607, longitude: 67.0011 },
  { name: 'Peshawar', province: 'KPK', latitude: 34.0151, longitude: 71.5249 },
  { name: 'Faisalabad', province: 'Punjab', latitude: 31.418, longitude: 73.079 },
  { name: 'Multan', province: 'Punjab', latitude: 30.1575, longitude: 71.5249 },
  { name: 'Quetta', province: 'Balochistan', latitude: 30.1798, longitude: 66.975 },
  { name: 'Hyderabad', province: 'Sindh', latitude: 25.3792, longitude: 68.3682 },
  { name: 'Sialkot', province: 'Punjab', latitude: 32.4945, longitude: 74.5229 },
  { name: 'Gujranwala', province: 'Punjab', latitude: 32.1877, longitude: 74.1945 },
  { name: 'Sargodha', province: 'Punjab', latitude: 32.0836, longitude: 72.6711 },
  { name: 'Bahawalpur', province: 'Punjab', latitude: 29.3956, longitude: 71.6836 },
  { name: 'Sukkur', province: 'Sindh', latitude: 27.7032, longitude: 68.8589 },
  { name: 'Larkana', province: 'Sindh', latitude: 27.559, longitude: 68.212 },
  { name: 'Abbottabad', province: 'KPK', latitude: 34.1688, longitude: 73.2215 },
  { name: 'Mardan', province: 'KPK', latitude: 34.1989, longitude: 72.0447 },
  { name: 'Swat', province: 'KPK', latitude: 35.222, longitude: 72.4258 },
  { name: 'Murree', province: 'Punjab', latitude: 33.907, longitude: 73.3903 },
  { name: 'Gilgit', province: 'GB', latitude: 35.9208, longitude: 74.3144 },
  { name: 'Muzaffarabad', province: 'AJK', latitude: 34.3709, longitude: 73.4707 },
  { name: 'Mirpur', province: 'AJK', latitude: 33.1484, longitude: 73.7519 },
  { name: 'Gwadar', province: 'Balochistan', latitude: 25.1216, longitude: 62.3254 },
  { name: 'Sahiwal', province: 'Punjab', latitude: 30.6682, longitude: 73.1114 },
  { name: 'Sheikhupura', province: 'Punjab', latitude: 31.7167, longitude: 73.985 },
  { name: 'Jhelum', province: 'Punjab', latitude: 32.9405, longitude: 73.7277 },
  { name: 'Gujrat', province: 'Punjab', latitude: 32.5742, longitude: 74.0754 },
  { name: 'Okara', province: 'Punjab', latitude: 30.8081, longitude: 73.4597 },
  { name: 'Kasur', province: 'Punjab', latitude: 31.1156, longitude: 74.4466 },
  { name: 'Dera Ghazi Khan', province: 'Punjab', latitude: 30.0561, longitude: 70.6348 },
  { name: 'Nawabshah', province: 'Sindh', latitude: 26.2442, longitude: 68.41 },
  { name: 'Mingora', province: 'KPK', latitude: 34.7717, longitude: 72.3601 },
];

export function getCityCenter(cityName: string): RideLocation {
  const city =
    PAKISTAN_CITY_LIST.find(c => c.name.toLowerCase() === cityName.toLowerCase()) ??
    PAKISTAN_CITY_LIST[0];
  return {
    latitude: city.latitude,
    longitude: city.longitude,
    address: `${city.name} City Center`,
  };
}

export function searchPakistanCities(query: string): PakistanCity[] {
  const q = query.trim().toLowerCase();
  if (!q) return PAKISTAN_CITY_LIST;
  return PAKISTAN_CITY_LIST.filter(
    c => c.name.toLowerCase().includes(q) || c.province.toLowerCase().includes(q),
  );
}

export function getAllCityNames(): string[] {
  return PAKISTAN_CITY_LIST.map(c => c.name);
}
