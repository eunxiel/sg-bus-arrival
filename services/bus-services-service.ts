import "server-only";
import { ltaFetch } from "@/services/lta-client";
import { mapBusServiceInfo } from "@/lib/mappers";
import type { LtaBusServicesResponse } from "@/types/lta";
import type { BusServiceInfo } from "@/types/bus";

const PAGE_SIZE = 500;
const MAX_PAGES = 15;

export async function getAllBusServices(): Promise<BusServiceInfo[]> {
  const all: BusServiceInfo[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const skip = page * PAGE_SIZE;
    const data = await ltaFetch<LtaBusServicesResponse>("/BusServices", {
      params: { $skip: skip },
    });
    const values = data.value ?? [];
    all.push(...values.map(mapBusServiceInfo));
    if (values.length < PAGE_SIZE) break;
  }

  return all;
}

export async function getBusServiceInfo(
  serviceNo: string
): Promise<BusServiceInfo[]> {
  const all = await getAllBusServices();
  return all.filter((s) => s.serviceNo === serviceNo);
}
