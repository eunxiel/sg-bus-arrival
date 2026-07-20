"use client";

import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { FavoriteService, FavoriteStop } from "@/types/bus";

const STOPS_KEY = "sgbus:favorite-stops";
const SERVICES_KEY = "sgbus:favorite-services";

export function useFavoriteStops() {
  const [stops, setStops] = useLocalStorage<FavoriteStop[]>(STOPS_KEY, []);

  const isFavorite = useCallback(
    (busStopCode: string) => stops.some((s) => s.busStopCode === busStopCode),
    [stops]
  );

  const toggle = useCallback(
    (stop: Omit<FavoriteStop, "savedAt">) => {
      setStops((prev) => {
        const exists = prev.some((s) => s.busStopCode === stop.busStopCode);
        if (exists) {
          return prev.filter((s) => s.busStopCode !== stop.busStopCode);
        }
        return [{ ...stop, savedAt: new Date().toISOString() }, ...prev];
      });
    },
    [setStops]
  );

  return { stops, isFavorite, toggle };
}

export function useFavoriteServices() {
  const [services, setServices] = useLocalStorage<FavoriteService[]>(
    SERVICES_KEY,
    []
  );

  const isFavorite = useCallback(
    (serviceNo: string, busStopCode: string) =>
      services.some(
        (s) => s.serviceNo === serviceNo && s.busStopCode === busStopCode
      ),
    [services]
  );

  const toggle = useCallback(
    (service: Omit<FavoriteService, "savedAt">) => {
      setServices((prev) => {
        const exists = prev.some(
          (s) =>
            s.serviceNo === service.serviceNo &&
            s.busStopCode === service.busStopCode
        );
        if (exists) {
          return prev.filter(
            (s) =>
              !(
                s.serviceNo === service.serviceNo &&
                s.busStopCode === service.busStopCode
              )
          );
        }
        return [{ ...service, savedAt: new Date().toISOString() }, ...prev];
      });
    },
    [setServices]
  );

  return { services, isFavorite, toggle };
}
