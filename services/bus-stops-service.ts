import "server-only";
import { fetchAllPages } from "@/services/lta-client";
import { mapBusStop } from "@/lib/mappers";
import type { LtaBusStop } from "@/types/lta";
import type { BusStop } from "@/types/bus";

// Safety cap (~6000 stops, more than enough for all of SG).
const MAX_PAGES = 12;

export async function getAllBusStops(): Promise<BusStop[]> {
  const rows = await fetchAllPages<LtaBusStop>("/BusStops", { maxPages: MAX_PAGES });
  return rows.map(mapBusStop);
}
