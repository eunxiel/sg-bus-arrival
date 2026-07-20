"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type { BusServiceInfo, RouteStop } from "@/types/bus";

interface BusServicesResponse {
  services: BusServiceInfo[];
}

interface BusRoutesResponse {
  route: RouteStop[];
}

export function useBusServiceInfo(serviceNo: string | null) {
  return useQuery({
    queryKey: ["bus-service-info", serviceNo],
    queryFn: () =>
      apiGet<BusServicesResponse>("/api/bus-services", {
        serviceNo: serviceNo ?? undefined,
      }),
    enabled: Boolean(serviceNo),
    staleTime: 60 * 60 * 1000,
  });
}

export function useBusRoute(serviceNo: string | null, direction?: number) {
  return useQuery({
    queryKey: ["bus-route", serviceNo, direction],
    queryFn: () =>
      apiGet<BusRoutesResponse>("/api/bus-routes", {
        serviceNo: serviceNo ?? undefined,
        direction,
      }),
    enabled: Boolean(serviceNo),
    staleTime: 60 * 60 * 1000,
  });
}
