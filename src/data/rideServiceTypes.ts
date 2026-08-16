/** InDriver-style ride service types for Pakistan (not car model names). */
export type RideServiceType = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  base_multiplier: number;
  description: string;
  localOnly?: boolean;
};

/** Local display order: Car, Mini Car, Rickshaw, Bike, Chingchi, AC Car */
export const RIDE_SERVICE_TYPES: RideServiceType[] = [
  { id: 'car', name: 'Car', slug: 'car', icon: '🚙', base_multiplier: 1.0, description: 'Standard sedan' },
  {
    id: 'mini_car',
    name: 'Mini Car',
    slug: 'mini_car',
    icon: '🚗',
    base_multiplier: 0.85,
    description: 'Compact hatchback',
    localOnly: true,
  },
  {
    id: 'rickshaw',
    name: 'Rickshaw',
    slug: 'rickshaw',
    icon: '🛺',
    base_multiplier: 0.55,
    description: 'Auto rickshaw',
    localOnly: true,
  },
  {
    id: 'bike',
    name: 'Bike',
    slug: 'bike',
    icon: '🏍',
    base_multiplier: 0.45,
    description: 'Motorcycle ride',
    localOnly: true,
  },
  {
    id: 'chingchi',
    name: 'Chingchi',
    slug: 'chingchi',
    icon: '🚜',
    base_multiplier: 0.65,
    description: 'Qingqi / loader rickshaw',
    localOnly: true,
  },
  {
    id: 'ac_car',
    name: 'AC Car',
    slug: 'ac_car',
    icon: '❄️',
    base_multiplier: 1.25,
    description: 'Air-conditioned car',
  },
];

/** Local rides: all types. City-to-city & rental: car class only. */
export function getRideTypesForService(serviceType: 'local' | 'city_to_city' | 'rental'): RideServiceType[] {
  if (serviceType === 'local') {
    return RIDE_SERVICE_TYPES;
  }
  return RIDE_SERVICE_TYPES.filter(t => t.slug === 'car' || t.slug === 'ac_car');
}

export function getDefaultRideTypeSlug(serviceType: 'local' | 'city_to_city' | 'rental'): string {
  return 'car';
}

export function isRideTypeAllowedForService(
  slug: string,
  serviceType: 'local' | 'city_to_city' | 'rental',
): boolean {
  return getRideTypesForService(serviceType).some(t => t.slug === slug);
}

export function getRideServiceType(slug: string): RideServiceType | undefined {
  return RIDE_SERVICE_TYPES.find(t => t.slug === slug);
}

export function getRideServiceMultiplier(slug: string): number {
  return getRideServiceType(slug)?.base_multiplier ?? 1;
}
