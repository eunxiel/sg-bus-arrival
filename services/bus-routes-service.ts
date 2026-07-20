import "server-only";
import { fetchAllPages } from "@/services/lta-client";
import { mapRouteStop } from "@/lib/mappers";
import type { LtaBusRoute } from "@/types/lta";
import type { RouteStop } from "@/types/bus";

// Full BusRoutes dataset is ~26k rows across all services; generous safety margin.
const MAX_PAGES = 80;

export async function getAllBusRoutes(): Promise<RouteStop[]> {
  const rows = await fetchAllPages<LtaBusRoute>("/BusRoutes", { maxPages: MAX_PAGES });
  return rows.map(mapRouteStop);
}

/** Fetch just the route stops belonging to a specific service + direction. */
export async function getRouteForService(
  serviceNo: string,
  direction?: number
): Promise<RouteStop[]> {
  const all = await getAllBusRoutes();
  return all
    .filter(
      (r) =>
        r.serviceNo === serviceNo &&
        (direction === undefined || r.direction === direction)
    )
    .sort((a, b) => a.stopSequence - b.stopSequence);
}
