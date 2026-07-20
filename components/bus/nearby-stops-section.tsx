"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { MapPinned, Search } from "lucide-react";
import { useGeolocation, SINGAPORE_FALLBACK_COORDS } from "@/hooks/use-geolocation";
import { useNearbyStops } from "@/hooks/use-nearby-stops";
import { useTranslation } from "@/hooks/use-translation";
import { BusStopCard } from "@/components/bus/bus-stop-card";
import { BusStopListSkeleton } from "@/components/ui/skeletons";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export function NearbyStopsSection() {
  const searchParams = useSearchParams();
  const { coords, locate } = useGeolocation();
  const { t } = useTranslation();

  const searchedLat = Number.parseFloat(searchParams.get("lat") ?? "");
  const searchedLng = Number.parseFloat(searchParams.get("lng") ?? "");
  const highlightStopCode = searchParams.get("stop");
  const hasSearchedLocation =
    Number.isFinite(searchedLat) && Number.isFinite(searchedLng);

  useEffect(() => {
    if (hasSearchedLocation) return;
    locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSearchedLocation]);

  const activeCoords = useMemo(() => {
    if (hasSearchedLocation) return { lat: searchedLat, lng: searchedLng };
    return coords ?? SINGAPORE_FALLBACK_COORDS;
  }, [hasSearchedLocation, searchedLat, searchedLng, coords]);

  const { data, isLoading, isError } = useNearbyStops(activeCoords, 600);

  const stops = data?.stops ?? [];

  return (
    <section className="mx-auto max-w-3xl px-4 pb-16" aria-label="Nearby bus stops">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-4 flex items-center gap-2"
      >
        {hasSearchedLocation ? (
          <Search className="h-5 w-5 text-brand-600" aria-hidden="true" />
        ) : (
          <MapPinned className="h-5 w-5 text-brand-600" aria-hidden="true" />
        )}
        <h2 className="font-heading text-lg font-semibold text-slate-900">
          {hasSearchedLocation ? t("nearby.titleSearched") : t("nearby.title")}
        </h2>
      </motion.div>

      {isLoading && <BusStopListSkeleton />}

      {!isLoading && isError && (
        <div className="glass-card p-6 text-center text-sm text-slate-500">
          {t("nearby.loadError")}
        </div>
      )}

      {!isLoading && !isError && stops.length === 0 && (
        <div className="glass-card p-6 text-center text-sm text-slate-500">
          {t("nearby.empty")}
        </div>
      )}

      <div className="space-y-4">
        {stops.map((stop, index) => (
          <ErrorBoundary key={stop.busStopCode} fallbackTitle={t("stopCard.boundaryFallback")}>
            <BusStopCard
              stop={stop}
              index={index}
              highlighted={stop.busStopCode === highlightStopCode}
            />
          </ErrorBoundary>
        ))}
      </div>
    </section>
  );
}
