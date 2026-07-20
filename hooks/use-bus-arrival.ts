"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type { BusServiceArrival } from "@/types/bus";

interface BusArrivalApiResponse {
  busStopCode: string;
  services: BusServiceArrival[];
}

export function useBusArrival(
  busStopCode: string | null,
  refreshIntervalSeconds = 15
) {
  return useQuery({
    queryKey: ["bus-arrival", busStopCode],
    queryFn: () =>
      apiGet<BusArrivalApiResponse>("/api/bus-arrival", {
        busStopCode: busStopCode ?? undefined,
      }),
    enabled: Boolean(busStopCode),
    refetchInterval: refreshIntervalSeconds * 1000,
    refetchIntervalInBackground: false,
    staleTime: 5000,
  });
}
