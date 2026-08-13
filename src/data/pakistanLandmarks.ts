import type { RideLocation } from '../types/ride';

export type LandmarkCategory =
  | 'airport'
  | 'market'
  | 'hospital'
  | 'landmark'
  | 'university'
  | 'transport'
  | 'mall';

type LandmarkSeed = RideLocation & {
  category: LandmarkCategory;
  city: string;
};

export type DestinationOption = RideLocation & {
  id: string;
  category?: LandmarkCategory;
  city?: string;
};

const seeds: LandmarkSeed[] = [
  // Islamabad & Rawalpindi
  { address: 'F-6 Markaz, Islamabad', latitude: 33.7294, longitude: 73.0389, category: 'market', city: 'Islamabad' },
  { address: 'F-7 Markaz, Islamabad', latitude: 33.7215, longitude: 73.0433, category: 'market', city: 'Islamabad' },
  { address: 'F-8 Markaz, Islamabad', latitude: 33.7098, longitude: 73.0365, category: 'market', city: 'Islamabad' },
  { address: 'F-10 Markaz, Islamabad', latitude: 33.6912, longitude: 73.0145, category: 'market', city: 'Islamabad' },
  { address: 'F-11 Markaz, Islamabad', latitude: 33.6845, longitude: 73.0032, category: 'market', city: 'Islamabad' },
  { address: 'Blue Area, Islamabad', latitude: 33.7077, longitude: 73.0563, category: 'landmark', city: 'Islamabad' },
  { address: 'Centaurus Mall, Islamabad', latitude: 33.7089, longitude: 73.0502, category: 'mall', city: 'Islamabad' },
  { address: 'Giga Mall, Islamabad', latitude: 33.6842, longitude: 73.0661, category: 'mall', city: 'Islamabad' },
  { address: 'Packages Mall (near Islamabad)', latitude: 33.6422, longitude: 73.0758, category: 'mall', city: 'Islamabad' },
  { address: 'Islamabad International Airport', latitude: 33.5607, longitude: 72.8516, category: 'airport', city: 'Islamabad' },
  { address: 'DHA Phase 2, Islamabad', latitude: 33.5341, longitude: 73.1677, category: 'landmark', city: 'Islamabad' },
  { address: 'Bahria Town, Islamabad', latitude: 33.4938, longitude: 73.1351, category: 'landmark', city: 'Islamabad' },
  { address: 'Pakistan Monument, Islamabad', latitude: 33.6938, longitude: 73.0672, category: 'landmark', city: 'Islamabad' },
  { address: 'Faisal Mosque, Islamabad', latitude: 33.7299, longitude: 73.0372, category: 'landmark', city: 'Islamabad' },
  { address: 'Lok Virsa Museum, Islamabad', latitude: 33.6931, longitude: 73.0684, category: 'landmark', city: 'Islamabad' },
  { address: 'Quaid-e-Azam University, Islamabad', latitude: 33.738, longitude: 73.084, category: 'university', city: 'Islamabad' },
  { address: 'Islamabad Railway Station', latitude: 33.6528, longitude: 73.0811, category: 'transport', city: 'Islamabad' },
  { address: 'PIMS Hospital, Islamabad', latitude: 33.7069, longitude: 73.0553, category: 'hospital', city: 'Islamabad' },
  { address: 'Shifa International Hospital, Islamabad', latitude: 33.6998, longitude: 73.0367, category: 'hospital', city: 'Islamabad' },
  { address: 'Saddar, Rawalpindi', latitude: 33.5973, longitude: 73.0479, category: 'market', city: 'Rawalpindi' },
  { address: 'Commercial Market, Rawalpindi', latitude: 33.6001, longitude: 73.0551, category: 'market', city: 'Rawalpindi' },
  { address: 'Raja Bazaar, Rawalpindi', latitude: 33.5956, longitude: 73.0524, category: 'market', city: 'Rawalpindi' },
  { address: 'Murree Mall Road', latitude: 33.907, longitude: 73.3903, category: 'landmark', city: 'Murree' },
  { address: 'Murree Express Bus Stand', latitude: 33.9045, longitude: 73.3922, category: 'transport', city: 'Murree' },

  // Lahore
  { address: 'Liberty Market, Lahore', latitude: 31.5102, longitude: 74.3441, category: 'market', city: 'Lahore' },
  { address: 'Anarkali Bazaar, Lahore', latitude: 31.5686, longitude: 74.3122, category: 'market', city: 'Lahore' },
  { address: 'Mall Road, Lahore', latitude: 31.5497, longitude: 74.3436, category: 'landmark', city: 'Lahore' },
  { address: 'Fortress Stadium, Lahore', latitude: 31.5322, longitude: 74.3645, category: 'landmark', city: 'Lahore' },
  { address: 'Packages Mall, Lahore', latitude: 31.4712, longitude: 74.3554, category: 'mall', city: 'Lahore' },
  { address: 'Emporium Mall, Lahore', latitude: 31.4674, longitude: 74.2662, category: 'mall', city: 'Lahore' },
  { address: 'Gulberg Main Boulevard, Lahore', latitude: 31.5204, longitude: 74.3587, category: 'landmark', city: 'Lahore' },
  { address: 'DHA Phase 5, Lahore', latitude: 31.4675, longitude: 74.4088, category: 'landmark', city: 'Lahore' },
  { address: 'Allama Iqbal International Airport, Lahore', latitude: 31.5216, longitude: 74.4036, category: 'airport', city: 'Lahore' },
  { address: 'Lahore Railway Station', latitude: 31.5686, longitude: 74.3053, category: 'transport', city: 'Lahore' },
  { address: 'Badshahi Mosque, Lahore', latitude: 31.588, longitude: 74.3101, category: 'landmark', city: 'Lahore' },
  { address: 'Lahore Fort', latitude: 31.5883, longitude: 74.3095, category: 'landmark', city: 'Lahore' },
  { address: 'University of Lahore', latitude: 31.4697, longitude: 74.2728, category: 'university', city: 'Lahore' },
  { address: 'LUMS, Lahore', latitude: 31.4708, longitude: 74.4081, category: 'university', city: 'Lahore' },
  { address: 'Services Hospital, Lahore', latitude: 31.5491, longitude: 74.3432, category: 'hospital', city: 'Lahore' },
  { address: 'Jinnah Hospital, Lahore', latitude: 31.4842, longitude: 74.2969, category: 'hospital', city: 'Lahore' },
  { address: 'Thokar Niaz Baig, Lahore', latitude: 31.4422, longitude: 74.2101, category: 'transport', city: 'Lahore' },

  // Karachi
  { address: 'Clifton, Karachi', latitude: 24.8138, longitude: 67.0299, category: 'landmark', city: 'Karachi' },
  { address: 'Saddar, Karachi', latitude: 24.8546, longitude: 67.0096, category: 'market', city: 'Karachi' },
  { address: 'Boat Basin, Karachi', latitude: 24.8132, longitude: 67.0281, category: 'market', city: 'Karachi' },
  { address: 'Jinnah International Airport, Karachi', latitude: 24.9065, longitude: 67.1608, category: 'airport', city: 'Karachi' },
  { address: 'Dolmen Mall Clifton, Karachi', latitude: 24.8028, longitude: 67.0281, category: 'mall', city: 'Karachi' },
  { address: 'Ocean Mall, Karachi', latitude: 24.8135, longitude: 67.0289, category: 'mall', city: 'Karachi' },
  { address: 'Lucky One Mall, Karachi', latitude: 24.9322, longitude: 67.0881, category: 'mall', city: 'Karachi' },
  { address: 'Karachi Cantt Railway Station', latitude: 24.8471, longitude: 67.0428, category: 'transport', city: 'Karachi' },
  { address: 'Karachi University, Karachi', latitude: 24.9056, longitude: 67.0822, category: 'university', city: 'Karachi' },
  { address: 'Aga Khan University Hospital, Karachi', latitude: 24.8938, longitude: 67.0752, category: 'hospital', city: 'Karachi' },
  { address: 'Jinnah Postgraduate Medical Centre, Karachi', latitude: 24.8912, longitude: 67.0751, category: 'hospital', city: 'Karachi' },
  { address: 'Port Grand, Karachi', latitude: 24.8445, longitude: 66.9998, category: 'landmark', city: 'Karachi' },
  { address: 'Bahria Town Karachi', latitude: 25.0167, longitude: 67.3089, category: 'landmark', city: 'Karachi' },
  { address: 'Soekarno-Hatta (Karachi Expo Centre area)', latitude: 24.8945, longitude: 67.1301, category: 'landmark', city: 'Karachi' },

  // Peshawar
  { address: 'University Road, Peshawar', latitude: 34.0011, longitude: 71.4989, category: 'landmark', city: 'Peshawar' },
  { address: 'Bala Hisar Fort, Peshawar', latitude: 34.0167, longitude: 71.5689, category: 'landmark', city: 'Peshawar' },
  { address: 'Peshawar Airport', latitude: 33.9939, longitude: 71.5146, category: 'airport', city: 'Peshawar' },
  { address: 'Qissa Khwani Bazaar, Peshawar', latitude: 34.0156, longitude: 71.5612, category: 'market', city: 'Peshawar' },
  { address: 'Lady Reading Hospital, Peshawar', latitude: 34.0089, longitude: 71.5589, category: 'hospital', city: 'Peshawar' },
  { address: 'Peshawar Railway Station', latitude: 34.0018, longitude: 71.5634, category: 'transport', city: 'Peshawar' },

  // Faisalabad
  { address: 'Clock Tower, Faisalabad', latitude: 31.418, longitude: 73.079, category: 'landmark', city: 'Faisalabad' },
  { address: 'D Ground, Faisalabad', latitude: 31.4273, longitude: 73.1167, category: 'market', city: 'Faisalabad' },
  { address: 'Faisalabad International Airport', latitude: 31.365, longitude: 72.9948, category: 'airport', city: 'Faisalabad' },
  { address: 'Allied Hospital, Faisalabad', latitude: 31.4122, longitude: 73.0891, category: 'hospital', city: 'Faisalabad' },

  // Multan
  { address: 'Hussain Agahi, Multan', latitude: 30.1978, longitude: 71.4697, category: 'market', city: 'Multan' },
  { address: 'Multan Airport', latitude: 30.2032, longitude: 71.4191, category: 'airport', city: 'Multan' },
  { address: 'Nishtar Hospital, Multan', latitude: 30.1956, longitude: 71.4752, category: 'hospital', city: 'Multan' },
  { address: 'Ghanta Ghar, Multan', latitude: 30.1989, longitude: 71.4682, category: 'landmark', city: 'Multan' },

  // Quetta
  { address: 'Millennium Mall, Quetta', latitude: 30.1798, longitude: 66.975, category: 'mall', city: 'Quetta' },
  { address: 'Quetta Airport', latitude: 30.2514, longitude: 66.9378, category: 'airport', city: 'Quetta' },
  { address: 'Civil Hospital, Quetta', latitude: 30.1956, longitude: 67.0012, category: 'hospital', city: 'Quetta' },
  { address: 'Jinnah Road, Quetta', latitude: 30.1921, longitude: 67.0018, category: 'market', city: 'Quetta' },

  // Hyderabad & Sindh
  { address: 'Resham Bazaar, Hyderabad', latitude: 25.3792, longitude: 68.3682, category: 'market', city: 'Hyderabad' },
  { address: 'Hyderabad Railway Station', latitude: 25.3812, longitude: 68.3738, category: 'transport', city: 'Hyderabad' },
  { address: 'Sukkur Barrage, Sukkur', latitude: 27.6889, longitude: 68.8572, category: 'landmark', city: 'Sukkur' },

  // Punjab cities
  { address: 'Sialkot Airport', latitude: 32.5356, longitude: 74.3639, category: 'airport', city: 'Sialkot' },
  { address: 'Clock Tower, Sialkot', latitude: 32.4945, longitude: 74.5229, category: 'landmark', city: 'Sialkot' },
  { address: 'Gujranwala City Centre', latitude: 32.1617, longitude: 74.1883, category: 'market', city: 'Gujranwala' },
  { address: 'Bahawalpur Airport', latitude: 29.3481, longitude: 71.718, category: 'airport', city: 'Bahawalpur' },
  { address: 'Sargodha City', latitude: 32.0836, longitude: 72.6711, category: 'landmark', city: 'Sargodha' },
  { address: 'Gujrat City', latitude: 32.5742, longitude: 74.0754, category: 'landmark', city: 'Gujrat' },

  // KPK & north
  { address: 'Abbottabad Main Bazaar', latitude: 34.1463, longitude: 73.2119, category: 'market', city: 'Abbottabad' },
  { address: 'Mingora, Swat', latitude: 34.7717, longitude: 72.3601, category: 'landmark', city: 'Swat' },
  { address: 'Gilgit City', latitude: 35.9208, longitude: 74.3144, category: 'landmark', city: 'Gilgit' },
  { address: 'Skardu Airport', latitude: 35.3355, longitude: 75.536, category: 'airport', city: 'Skardu' },

  // Islamabad hospitals (more)
  { address: 'KRL Hospital, Islamabad', latitude: 33.6456, longitude: 73.0672, category: 'hospital', city: 'Islamabad' },
  { address: 'Maroof International Hospital, Islamabad', latitude: 33.6845, longitude: 73.0456, category: 'hospital', city: 'Islamabad' },
];

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const PAKISTAN_LANDMARKS: DestinationOption[] = seeds.map((seed, index) => ({
  id: `${slugify(seed.city)}-${slugify(seed.address)}-${index}`,
  address: seed.address,
  latitude: seed.latitude,
  longitude: seed.longitude,
  category: seed.category,
  city: seed.city,
}));

export const LANDMARK_CATEGORIES: { id: LandmarkCategory; label: string }[] = [
  { id: 'landmark', label: 'Landmarks' },
  { id: 'mall', label: 'Malls' },
  { id: 'market', label: 'Markets' },
  { id: 'airport', label: 'Airports' },
  { id: 'hospital', label: 'Hospitals' },
  { id: 'university', label: 'Universities' },
  { id: 'transport', label: 'Transport' },
];

export const PAKISTAN_CITIES = [
  { name: 'Islamabad', latitude: 33.6844, longitude: 73.0479 },
  { name: 'Rawalpindi', latitude: 33.5973, longitude: 73.0479 },
  { name: 'Lahore', latitude: 31.5204, longitude: 74.3587 },
  { name: 'Karachi', latitude: 24.8607, longitude: 67.0011 },
  { name: 'Peshawar', latitude: 34.0151, longitude: 71.5249 },
  { name: 'Faisalabad', latitude: 31.418, longitude: 73.079 },
  { name: 'Multan', latitude: 30.1575, longitude: 71.5249 },
  { name: 'Quetta', latitude: 30.1798, longitude: 66.975 },
  { name: 'Hyderabad', latitude: 25.3792, longitude: 68.3682 },
  { name: 'Murree', latitude: 33.907, longitude: 73.3903 },
];
