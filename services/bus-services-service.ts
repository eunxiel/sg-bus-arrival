import "server-only";
import { fetchAllPages } from "@/services/lta-client";
import { mapBusServiceInfo } from "@/lib/mappers";
import type { LtaBusServiceInfo } from "@/types/lta";
import type { BusServiceInfo } from "@/types/bus";

const MAX_PAGES = 15;

export async function getAllBusServices(): Promise<BusServiceInfo[]> {
  const rows = await fetchAllPages<LtaBusServiceInfo>("/BusServices", {
    maxPages: MAX_PAGES,
  });
  return rows.map(mapBusServiceInfo);
}

export async function getBusServiceInfo(
  serviceNo: string
): Promise<BusServiceInfo[]> {
  const all = await getAllBusServices();
  return all.filter((s) => s.serviceNo === serviceNo);
}
