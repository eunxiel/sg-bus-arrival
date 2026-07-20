"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Heart, MapPin, Navigation2, RefreshCw } from "lucide-react";
import { useBusArrival } from "@/hooks/use-bus-arrival";
import { useFavoriteServices, useFavoriteStops } from "@/hooks/use-favorites";
import { useSettings } from "@/hooks/use-settings";
import { useTranslation } from "@/hooks/use-translation";
import { BusServiceRow } from "@/components/bus/bus-service-row";
import { BusStopCardSkeleton } from "@/components/ui/skeletons";
import { cn, formatDistance } from "@/lib/utils";
import type { BusStop } from "@/types/bus";

interface BusStopCardProps {
  stop: BusStop;
  index?: number;
  highlighted?: boolean;
}

export function BusStopCard({ stop, index = 0, highlighted = false }: BusStopCardProps) {
  const { settings } = useSettings();
  const { data, isLoading, isError, isFetching, refetch } = useBusArrival(
    stop.busStopCode,
    settings.refreshIntervalSeconds
  );
  const { isFavorite: isStopFavorite, toggle: toggleStopFavorite } =
    useFavoriteStops();
  const { isFavorite: isServiceFavorite, toggle: toggleServiceFavorite } =
    useFavoriteServices();
  const { t } = useTranslation();
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (highlighted && !isLoading) {
      articleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlighted, isLoading]);

  if (isLoading) return <BusStopCardSkeleton />;

  const services = data?.services ?? [];
  const favorited = isStopFavorite(stop.busStopCode);

  return (
    <motion.article
      ref={articleRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className={cn(
        "glass-card-hover p-5",
        highlighted && "ring-2 ring-brand-500"
      )}
      aria-label={`Bus stop ${stop.description}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-slate-900">
              {stop.description}
            </h3>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {stop.roadName}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-500">
              {stop.busStopCode}
            </span>
            {typeof stop.distanceMeters === "number" && (
              <span className="flex items-center gap-1 text-brand-600">
                <Navigation2 className="h-3 w-3" aria-hidden="true" />
                {formatDistance(stop.distanceMeters)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => refetch()}
            aria-label={t("stopCard.refreshAria")}
            className="rounded-full p-2 text-slate-400 transition-colors hover:text-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <RefreshCw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            onClick={() =>
              toggleStopFavorite({
                busStopCode: stop.busStopCode,
                description: stop.description,
                roadName: stop.roadName,
              })
            }
            aria-pressed={favorited}
            aria-label={
              favorited
                ? t("stopCard.removeFavAria", { name: stop.description })
                : t("stopCard.addFavAria", { name: stop.description })
            }
            className="rounded-full p-2 text-slate-400 transition-colors hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <Heart
              className={cn("h-4 w-4", favorited && "fill-red-500 text-red-500")}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {isError && (
          <p className="rounded-2xl bg-red-50 p-3 text-xs text-red-600">
            {t("stopCard.loadError")}
          </p>
        )}

        {!isError && services.length === 0 && (
          <p className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">
            {t("stopCard.noServices")}
          </p>
        )}

        {services.map((service) => (
          <BusServiceRow
            key={service.serviceNo}
            busStopCode={stop.busStopCode}
            service={service}
            isFavorite={isServiceFavorite(service.serviceNo, stop.busStopCode)}
            onToggleFavorite={() =>
              toggleServiceFavorite({
                serviceNo: service.serviceNo,
                busStopCode: stop.busStopCode,
                stopDescription: stop.description,
              })
            }
          />
        ))}
      </div>
    </motion.article>
  );
}
