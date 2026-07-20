"use client";

import { useEffect, useRef } from "react";
import { useQueries } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import { useFavoriteServices } from "@/hooks/use-favorites";
import { useNotifications } from "@/hooks/use-notifications";
import { useSettings } from "@/hooks/use-settings";
import { useTranslation } from "@/hooks/use-translation";
import type { BusServiceArrival } from "@/types/bus";

const ARRIVING_SOON_THRESHOLD_SECONDS = 120;

interface BusArrivalApiResponse {
  busStopCode: string;
  services: BusServiceArrival[];
}

/**
 * Polls arrival data for every favorited (service, stop) pair and raises an
 * "arriving soon" notification once per arrival window, avoiding duplicate
 * spam by tracking which arrival timestamps have already been notified.
 */
export function useArrivalWatcher() {
  const { services: favoriteServices } = useFavoriteServices();
  const { push } = useNotifications();
  const { settings } = useSettings();
  const { t } = useTranslation();
  const notifiedRef = useRef<Set<string>>(new Set());

  const queries = useQueries({
    queries: favoriteServices.map((fav) => ({
      queryKey: ["bus-arrival-watch", fav.busStopCode],
      queryFn: () =>
        apiGet<BusArrivalApiResponse>("/api/bus-arrival", {
          busStopCode: fav.busStopCode,
        }),
      refetchInterval: settings.refreshIntervalSeconds * 1000,
      staleTime: 5000,
    })),
  });

  useEffect(() => {
    queries.forEach((query, idx) => {
      const fav = favoriteServices[idx];
      if (!fav || !query.data) return;

      const service = query.data.services.find(
        (s) => s.serviceNo === fav.serviceNo
      );
      if (!service?.next.etaSeconds || !service.next.etaISO) return;

      const dedupeKey = `${fav.serviceNo}-${fav.busStopCode}-${service.next.etaISO}`;
      if (
        service.next.etaSeconds <= ARRIVING_SOON_THRESHOLD_SECONDS &&
        !notifiedRef.current.has(dedupeKey)
      ) {
        notifiedRef.current.add(dedupeKey);
        push({
          kind: "arrival",
          title: t("watcher.title", { serviceNo: fav.serviceNo }),
          message: t("watcher.message", {
            serviceNo: fav.serviceNo,
            stop: fav.stopDescription,
            minutes: Math.round(service.next.etaSeconds / 60),
          }),
          busStopCode: fav.busStopCode,
          serviceNo: fav.serviceNo,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries.map((q) => q.dataUpdatedAt).join(",")]);
}
