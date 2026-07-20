import "server-only";
import { ltaFetch } from "@/services/lta-client";
import { mapBusService } from "@/lib/mappers";
import type { LtaBusArrivalResponse } from "@/types/lta";
import type { BusServiceArrival } from "@/types/bus";

export interface BusArrivalResult {
  busStopCode: string;
  services: BusServiceArrival[];
}

/**
 * Fetch live bus arrival predictions for a given bus stop, optionally
 * filtered to a single service number.
 */
export async function getBusArrivals(
  busStopCode: string,
  serviceNo?: string
): Promise<BusArrivalResult> {
  const params = { BusStopCode: busStopCode, ServiceNo: serviceNo };

  let data: LtaBusArrivalResponse;
  try {
    // Current endpoint (LTA DataMall v3 revamp, still referred to as "BusArrivalv2").
    data = await ltaFetch<LtaBusArrivalResponse>("/v3/BusArrival", { params });
  } catch {
    // Fall back to the legacy path in case an account is still pinned to it.
    data = await ltaFetch<LtaBusArrivalResponse>("/BusArrivalv2", { params });
  }

  return {
    busStopCode: data.BusStopCode,
    services: (data.Services ?? []).map(mapBusService),
  };
}
