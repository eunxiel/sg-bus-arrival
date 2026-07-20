import type {
  LtaBusRoute,
  LtaBusService,
  LtaBusServiceInfo,
  LtaBusStop,
  LtaNextBus,
} from "@/types/lta";
import type {
  BusLoad,
  BusServiceArrival,
  BusServiceInfo,
  BusStop,
  BusType,
  NextArrival,
  RouteStop,
} from "@/types/bus";
import { operatorFullName, secondsUntil } from "@/lib/utils";

function mapLoad(load: string): BusLoad {
  switch (load) {
    case "SEA":
      return "seats_available";
    case "SDA":
      return "standing_available";
    case "LSD":
      return "limited_standing";
    default:
      return "unknown";
  }
}

function mapBusType(type: string): BusType {
  switch (type) {
    case "SD":
      return "single_deck";
    case "DD":
      return "double_deck";
    case "BD":
      return "bendy";
    default:
      return "unknown";
  }
}

function mapNextBus(raw: LtaNextBus | undefined): NextArrival {
  if (!raw || (!raw.EstimatedArrival && !raw.OriginCode)) {
    return {
      etaISO: null,
      etaSeconds: null,
      latitude: null,
      longitude: null,
      load: "unknown",
      wheelchairAccessible: false,
      busType: "unknown",
      monitored: false,
    };
  }

  const lat = Number.parseFloat(raw.Latitude);
  const lng = Number.parseFloat(raw.Longitude);

  return {
    etaISO: raw.EstimatedArrival || null,
    etaSeconds: secondsUntil(raw.EstimatedArrival || null),
    latitude: Number.isFinite(lat) && lat !== 0 ? lat : null,
    longitude: Number.isFinite(lng) && lng !== 0 ? lng : null,
    load: mapLoad(raw.Load ?? ""),
    wheelchairAccessible: raw.Feature === "WAB",
    busType: mapBusType(raw.Type ?? ""),
    monitored: raw.Monitored === 1,
  };
}

export function mapBusService(raw: LtaBusService): BusServiceArrival {
  return {
    serviceNo: raw.ServiceNo,
    operator: raw.Operator,
    operatorFullName: operatorFullName(raw.Operator),
    next: mapNextBus(raw.NextBus),
    next2: mapNextBus(raw.NextBus2),
    next3: mapNextBus(raw.NextBus3),
  };
}

export function mapBusStop(raw: LtaBusStop): BusStop {
  return {
    busStopCode: raw.BusStopCode,
    roadName: raw.RoadName,
    description: raw.Description,
    latitude: raw.Latitude,
    longitude: raw.Longitude,
  };
}

export function mapRouteStop(raw: LtaBusRoute): RouteStop {
  return {
    serviceNo: raw.ServiceNo,
    operator: raw.Operator,
    direction: raw.Direction,
    stopSequence: raw.StopSequence,
    busStopCode: raw.BusStopCode,
    distanceKm: raw.Distance,
    firstBusWeekday: raw.WD_FirstBus,
    lastBusWeekday: raw.WD_LastBus,
    firstBusSaturday: raw.SAT_FirstBus,
    lastBusSaturday: raw.SAT_LastBus,
    firstBusSunday: raw.SUN_FirstBus,
    lastBusSunday: raw.SUN_LastBus,
  };
}

export function mapBusServiceInfo(raw: LtaBusServiceInfo): BusServiceInfo {
  return {
    serviceNo: raw.ServiceNo,
    operator: raw.Operator,
    direction: raw.Direction,
    category: raw.Category,
    originCode: raw.OriginCode,
    destinationCode: raw.DestinationCode,
    amPeakFreq: raw.AM_Peak_Freq,
    amOffpeakFreq: raw.AM_Offpeak_Freq,
    pmPeakFreq: raw.PM_Peak_Freq,
    pmOffpeakFreq: raw.PM_Offpeak_Freq,
    loopDesc: raw.LoopDesc,
  };
}
