"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { RouteMapDynamic } from "@/components/map/route-map-dynamic";
import { useBusRoute } from "@/hooks/use-bus-route";
import { useBusArrival } from "@/hooks/use-bus-arrival";
import { useSettings } from "@/hooks/use-settings";
import { useTranslation } from "@/hooks/use-translation";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { MapSkeleton } from "@/components/ui/skeletons";

interface RouteViewProps {
  serviceNo: string;
}

export function RouteView({ serviceNo }: RouteViewProps) {
  const { settings } = useSettings();
  const { t } = useTranslation();
  const [direction, setDirection] = useState(1);
  const { data: routeData, isLoading: routeLoading } = useBusRoute(
    serviceNo,
    direction
  );

  const routeStops = routeData?.route ?? [];
  const firstStopCode = routeStops[0]?.busStopCode ?? null;

  const { data: arrivalData } = useBusArrival(
    firstStopCode,
    settings.refreshIntervalSeconds
  );

  const trackedService = arrivalData?.services.find(
    (s) => s.serviceNo === serviceNo
  );

  const liveBus = useMemo(() => {
    const next = trackedService?.next;
    if (next?.latitude && next?.longitude) {
      return { latitude: next.latitude, longitude: next.longitude };
    }
    return null;
  }, [trackedService]);

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <div className="absolute inset-0">
        {routeLoading ? (
          <div className="h-full w-full p-3">
            <MapSkeleton />
          </div>
        ) : (
          <ErrorBoundary fallbackTitle={t("route.mapError")}>
            <div className="h-full w-full p-3">
              <RouteMapDynamic
                routeStops={routeStops}
                liveBus={liveBus}
                currentStopCode={firstStopCode}
              />
            </div>
          </ErrorBoundary>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pointer-events-none absolute inset-x-0 top-0 z-[1100] flex items-start justify-between gap-3 p-4"
      >
        <Link
          href={`/bus/${serviceNo}`}
          className="btn-glass pointer-events-auto h-11 px-4 text-sm"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("common.busLabel", { serviceNo })}
        </Link>

        <button
          type="button"
          onClick={() => setDirection((d) => (d === 1 ? 2 : 1))}
          className="btn-glass pointer-events-auto h-11 px-4 text-sm"
          aria-label={t("route.directionAria")}
        >
          {t("route.direction", { n: direction })}
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </button>
      </motion.div>
    </main>
  );
}
