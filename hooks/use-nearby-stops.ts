"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type { BusStop } from "@/types/bus";

interface NearbyStopsResponse {
  stops: BusStop[];
}

export function useNearbyStops(
  coords: { lat: number; lng: number } | null,
  radiusMeters = 500
) {
  return useQuery({
    queryKey: ["nearby-stops", coords?.lat, coords?.lng, radiusMeters],
    queryFn: () =>
      apiGet<NearbyStopsResponse>("/api/bus-stops/nearby", {
        lat: coords?.lat,
        lng: coords?.lng,
        radius: radiusMeters,
      }),
    enabled: Boolean(coords),
    staleTime: 60_000,
  });
}
