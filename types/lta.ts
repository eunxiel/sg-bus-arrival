/**
 * Raw response types from LTA DataMall API.
 * Reference: https://datamall.lta.gov.sg/content/datamall/en/dynamic-data.html
 */

export type LtaBusLoad = "SEA" | "SDA" | "LSD"; // Seats Available / Standing Available / Limited Standing
export type LtaBusType = "SD" | "DD" | "BD"; // Single Deck / Double Deck / Bendy
export type LtaBusFeature = "WAB" | ""; // Wheelchair Accessible Bus

export interface LtaNextBus {
  OriginCode: string;
  DestinationCode: string;
  EstimatedArrival: string; // ISO 8601, empty string if unavailable
  Latitude: string;
  Longitude: string;
  VisitNumber: string;
  Load: LtaBusLoad | "";
  Feature: LtaBusFeature;
  Type: LtaBusType | "";
  Monitored?: number;
}

export interface LtaBusService {
  ServiceNo: string;
  Operator: string;
  NextBus: LtaNextBus;
  NextBus2: LtaNextBus;
  NextBus3: LtaNextBus;
}

export interface LtaBusArrivalResponse {
  "odata.metadata": string;
  BusStopCode: string;
  Services: LtaBusService[];
}

export interface LtaBusStop {
  BusStopCode: string;
  RoadName: string;
  Description: string;
  Latitude: number;
  Longitude: number;
}

export interface LtaBusStopsResponse {
  "odata.metadata": string;
  value: LtaBusStop[];
}

export interface LtaBusRoute {
  ServiceNo: string;
  Operator: string;
  Direction: number;
  StopSequence: number;
  BusStopCode: string;
  Distance: number; // km from origin
  WD_FirstBus: string; // HHmm
  WD_LastBus: string;
  SAT_FirstBus: string;
  SAT_LastBus: string;
  SUN_FirstBus: string;
  SUN_LastBus: string;
}

export interface LtaBusRoutesResponse {
  "odata.metadata": string;
  value: LtaBusRoute[];
}

export type LtaServiceCategory =
  | "TRUNK"
  | "FEEDER"
  | "EXPRESS"
  | "SPECIAL"
  | "CITY"
  | "CITY DIRECT"
  | "REGIONAL"
  | "TOWNLINK";

export interface LtaBusServiceInfo {
  ServiceNo: string;
  Operator: string;
  Direction: number;
  Category: LtaServiceCategory | string;
  OriginCode: string;
  DestinationCode: string;
  AM_Peak_Freq: string;
  AM_Offpeak_Freq: string;
  PM_Peak_Freq: string;
  PM_Offpeak_Freq: string;
  LoopDesc: string;
}

export interface LtaBusServicesResponse {
  "odata.metadata": string;
  value: LtaBusServiceInfo[];
}
