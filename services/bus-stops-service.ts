import "server-only";
import { ltaFetch } from "@/services/lta-client";
import { mapBusStop } from "@/lib/mappers";
import type { LtaBusStopsResponse } from "@/types/lta";
import type { BusStop } from "@/types/bus";

const PAGE_SIZE = 500;
const MAX_PAGES = 12; // safety cap (~6000 stops, more than enough for all of SG)

/**
 * LTA paginates BusStops/BusRoutes/BusServices at 500 records per call via
 * $skip. This fetches every page and concatenates the results.
 */
export async function getAllBusStops(): Promise<BusStop[]> {
  const all: BusStop[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const skip = page * PAGE_SIZE;
    const data = await ltaFetch<LtaBusStopsResponse>("/BusStops", {
      params: { $skip: skip },
    });
    const values = data.value ?? [];
    all.push(...values.map(mapBusStop));
    if (values.length < PAGE_SIZE) break;
  }

  return all;
}
