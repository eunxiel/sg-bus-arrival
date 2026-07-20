export type BusLoad = "seats_available" | "standing_available" | "limited_standing" | "unknown";
export type BusType = "single_deck" | "double_deck" | "bendy" | "unknown";

export interface NextArrival {
  etaISO: string | null;
  etaSeconds: number | null; // seconds from now, null if unknown
  latitude: number | null;
  longitude: number | null;
  load: BusLoad;
  wheelchairAccessible: boolean;
  busType: BusType;
  monitored: boolean;
}

export interface BusServiceArrival {
  serviceNo: string;
  operator: string;
  operatorFullName: string;
  next: NextArrival;
  next2: NextArrival;
  next3: NextArrival;
}

export interface BusStop {
  busStopCode: string;
  roadName: string;
  description: string;
  latitude: number;
  longitude: number;
  distanceMeters?: number;
}

export interface BusStopWithArrivals extends BusStop {
  services: BusServiceArrival[];
}

export interface RouteStop {
  serviceNo: string;
  operator: string;
  direction: number;
  stopSequence: number;
  busStopCode: string;
  distanceKm: number;
  firstBusWeekday: string;
  lastBusWeekday: string;
  firstBusSaturday: string;
  lastBusSaturday: string;
  firstBusSunday: string;
  lastBusSunday: string;
  stop?: BusStop;
}

export interface BusServiceInfo {
  serviceNo: string;
  operator: string;
  direction: number;
  category: string;
  originCode: string;
  destinationCode: string;
  amPeakFreq: string;
  amOffpeakFreq: string;
  pmPeakFreq: string;
  pmOffpeakFreq: string;
  loopDesc: string;
}

export type NotificationKind = "arrival" | "delay" | "disruption" | "closure";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  busStopCode?: string;
  serviceNo?: string;
}

export type SearchResultKind = "bus_service" | "bus_stop" | "mrt_station" | "mall";

export interface SearchResult {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle: string;
  busStopCode?: string;
  serviceNo?: string;
  latitude?: number;
  longitude?: number;
}

export interface FavoriteStop {
  busStopCode: string;
  description: string;
  roadName: string;
  savedAt: string;
}

export interface FavoriteService {
  serviceNo: string;
  busStopCode: string;
  stopDescription: string;
  savedAt: string;
}

export interface TripSuggestion {
  serviceNo: string;
  operator: string;
  boardStop: {
    busStopCode: string;
    description: string;
    walkMeters: number;
  };
  alightStop: {
    busStopCode: string;
    description: string;
  };
  boardEtaSeconds: number;
  boardEtaISO: string | null;
  travelSeconds: number;
  totalSeconds: number;
  numStops: number;
  distanceKm: number;
  load: BusLoad;
  wheelchairAccessible: boolean;
}

export type MapTheme = "light" | "dark" | "satellite";
export type AppLanguage = "en" | "zh" | "th" | "ms" | "id";

export interface AppSettings {
  language: AppLanguage;
  refreshIntervalSeconds: number;
  mapTheme: MapTheme;
}
