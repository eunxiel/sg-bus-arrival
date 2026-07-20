/**
 * Small curated dataset of Singapore MRT stations and shopping malls used to
 * power "search by MRT station" / "search by mall" so results can be mapped
 * to the nearest LTA bus stop. This is intentionally a lightweight seed list
 * (not exhaustive) — extend as needed.
 */

export interface PoiEntry {
  name: string;
  latitude: number;
  longitude: number;
}

export const MRT_STATIONS: PoiEntry[] = [
  { name: "Raffles Place MRT", latitude: 1.2839, longitude: 103.8515 },
  { name: "City Hall MRT", latitude: 1.2931, longitude: 103.8519 },
  { name: "Dhoby Ghaut MRT", latitude: 1.2989, longitude: 103.8459 },
  { name: "Orchard MRT", latitude: 1.3041, longitude: 103.8318 },
  { name: "Somerset MRT", latitude: 1.3005, longitude: 103.8385 },
  { name: "Newton MRT", latitude: 1.3128, longitude: 103.8382 },
  { name: "Novena MRT", latitude: 1.3203, longitude: 103.8438 },
  { name: "Toa Payoh MRT", latitude: 1.3327, longitude: 103.8474 },
  { name: "Bishan MRT", latitude: 1.3512, longitude: 103.8486 },
  { name: "Ang Mo Kio MRT", latitude: 1.3699, longitude: 103.8496 },
  { name: "Jurong East MRT", latitude: 1.3331, longitude: 103.7422 },
  { name: "Clementi MRT", latitude: 1.3151, longitude: 103.7651 },
  { name: "Buona Vista MRT", latitude: 1.3072, longitude: 103.7903 },
  { name: "Tampines MRT", latitude: 1.3535, longitude: 103.9451 },
  { name: "Bedok MRT", latitude: 1.3240, longitude: 103.9300 },
  { name: "Paya Lebar MRT", latitude: 1.3181, longitude: 103.8925 },
  { name: "Punggol MRT", latitude: 1.4053, longitude: 103.9022 },
  { name: "Sengkang MRT", latitude: 1.3915, longitude: 103.8950 },
  { name: "Woodlands MRT", latitude: 1.4368, longitude: 103.7864 },
  { name: "Yishun MRT", latitude: 1.4295, longitude: 103.8352 },
  { name: "Bugis MRT", latitude: 1.3006, longitude: 103.8559 },
  { name: "Chinatown MRT", latitude: 1.2846, longitude: 103.8440 },
  { name: "Outram Park MRT", latitude: 1.2803, longitude: 103.8394 },
  { name: "HarbourFront MRT", latitude: 1.2653, longitude: 103.8220 },
  { name: "Marina Bay MRT", latitude: 1.2762, longitude: 103.8544 },
  { name: "Tanjong Pagar MRT", latitude: 1.2765, longitude: 103.8459 },
  { name: "Serangoon MRT", latitude: 1.3499, longitude: 103.8735 },
  { name: "Kovan MRT", latitude: 1.3603, longitude: 103.8850 },
  { name: "Boon Lay MRT", latitude: 1.3387, longitude: 103.7064 },
  { name: "Choa Chu Kang MRT", latitude: 1.3854, longitude: 103.7443 },
];

export const SHOPPING_MALLS: PoiEntry[] = [
  { name: "ION Orchard", latitude: 1.3039, longitude: 103.8318 },
  { name: "Ngee Ann City", latitude: 1.3037, longitude: 103.8319 },
  { name: "Plaza Singapura", latitude: 1.3006, longitude: 103.8452 },
  { name: "Bugis Junction", latitude: 1.2995, longitude: 103.8556 },
  { name: "Suntec City", latitude: 1.2952, longitude: 103.8579 },
  { name: "Marina Bay Sands", latitude: 1.2834, longitude: 103.8607 },
  { name: "VivoCity", latitude: 1.2643, longitude: 103.8221 },
  { name: "Jurong Point", latitude: 1.3399, longitude: 103.7066 },
  { name: "Westgate", latitude: 1.3346, longitude: 103.7430 },
  { name: "IMM", latitude: 1.3345, longitude: 103.7469 },
  { name: "Tampines Mall", latitude: 1.3534, longitude: 103.9450 },
  { name: "Tampines 1", latitude: 1.3527, longitude: 103.9437 },
  { name: "Nex", latitude: 1.3505, longitude: 103.8722 },
  { name: "AMK Hub", latitude: 1.3695, longitude: 103.8489 },
  { name: "Junction 8", latitude: 1.3505, longitude: 103.8478 },
  { name: "Causeway Point", latitude: 1.4362, longitude: 103.7860 },
  { name: "Northpoint City", latitude: 1.4293, longitude: 103.8354 },
  { name: "Compass One", latitude: 1.3914, longitude: 103.8951 },
  { name: "Waterway Point", latitude: 1.4064, longitude: 103.9024 },
  { name: "Paya Lebar Quarter", latitude: 1.3178, longitude: 103.8925 },
  { name: "Parkway Parade", latitude: 1.3016, longitude: 103.9057 },
  { name: "Bedok Mall", latitude: 1.3243, longitude: 103.9301 },
  { name: "Great World City", latitude: 1.2938, longitude: 103.8320 },
  { name: "Raffles City", latitude: 1.2936, longitude: 103.8532 },
  { name: "Funan", latitude: 1.2933, longitude: 103.8500 },
];
