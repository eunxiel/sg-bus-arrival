import "server-only";
import { ltaFetch } from "@/services/lta-client";
import { mapRouteStop } from "@/lib/mappers";
import type { LtaBusRoutesResponse } from "@/types/lta";
import type { RouteStop } from "@/types/bus";

const PAGE_SIZE = 500;
const MAX_PAGES = 80; // full BusRoutes dataset is ~26k rows across all services; generous safety margin

export async function getAllBusRoutes(): Promise<RouteStop[]> {
  const all: RouteStop[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const skip = page * PAGE_SIZE;
    const data = await ltaFetch<LtaBusRoutesResponse>("/BusRoutes", {
      params: { $skip: skip },
    });
    const values = data.value ?? [];
    all.push(...values.map(mapRouteStop));
    if (values.length < PAGE_SIZE) break;
  }

  return all;
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
