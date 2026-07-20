"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeftRight, Flag, MapPin, Navigation } from "lucide-react";
import { PlaceInput, type Place } from "@/components/trip/place-input";
import { AnimatedCountdown } from "@/components/bus/animated-countdown";
import { OccupancyBadge, WheelchairBadge } from "@/components/bus/service-badges";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { TripSuggestionsSkeleton } from "@/components/ui/skeletons";
import { apiGet } from "@/lib/api-client";
import { useTranslation } from "@/hooks/use-translation";
import { cn, formatClock, formatDistance } from "@/lib/utils";
import type { TripSuggestion } from "@/types/bus";

interface TripPlanResponse {
  suggestions: TripSuggestion[];
}

export function TripPlannerView({
  headingLevel = "h1",
}: {
  headingLevel?: "h1" | "h2";
}) {
  const { t } = useTranslation();
  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  const Heading = headingLevel;

  const ready = Boolean(from && to);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["trip-plan", from?.lat, from?.lng, to?.lat, to?.lng],
    queryFn: () =>
      apiGet<TripPlanResponse>("/api/trip-plan", {
        fromLat: from!.lat,
        fromLng: from!.lng,
        toLat: to!.lat,
        toLng: to!.lng,
      }),
    enabled: ready,
    staleTime: 15_000,
    refetchInterval: ready ? 15_000 : false,
  });

  const suggestions = data?.suggestions ?? [];

  function handleSwap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Heading className="font-heading text-2xl font-bold text-slate-900">
          {t("trip.title")}
        </Heading>
      </motion.div>
      <p className="mt-1 text-sm text-slate-500">{t("trip.subtitle")}</p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card relative mt-6 space-y-1 p-4"
      >
        <PlaceInput
          icon={Navigation}
          placeholder={t("trip.fromPlaceholder")}
          value={from}
          onSelect={setFrom}
          allowCurrentLocation
        />

        <div className="relative flex items-center justify-center py-1">
          <div className="h-px w-full bg-slate-200/70" />
          <button
            type="button"
            onClick={handleSwap}
            aria-label={t("trip.swapAria")}
            className="btn-glass absolute h-9 w-9 shrink-0 p-0"
          >
            <ArrowLeftRight className="h-4 w-4 rotate-90" aria-hidden="true" />
          </button>
        </div>

        <PlaceInput
          icon={MapPin}
          placeholder={t("trip.toPlaceholder")}
          value={to}
          onSelect={setTo}
        />
      </motion.div>

      {!ready ? (
        <p className="mt-8 text-center text-sm text-slate-400">{t("trip.promptBoth")}</p>
      ) : (
        <ErrorBoundary fallbackTitle={t("trip.loadError")}>
          <div className="mt-6 space-y-3">
            {isFetching && !data && <TripSuggestionsSkeleton />}

            {!isFetching && isError && (
              <div className="glass-card p-6 text-center text-sm text-slate-500">
                {t("trip.loadError")}
              </div>
            )}

            {!isFetching && !isError && suggestions.length === 0 && (
              <div className="glass-card p-6 text-center text-sm text-slate-500">
                {t("trip.empty")}
              </div>
            )}

            {suggestions.map((suggestion, index) => (
              <TripSuggestionCard key={suggestion.serviceNo} suggestion={suggestion} rank={index} />
            ))}
          </div>
        </ErrorBoundary>
      )}
    </div>
  );
}

function TripSuggestionCard({
  suggestion,
  rank,
}: {
  suggestion: TripSuggestion;
  rank: number;
}) {
  const { t } = useTranslation();
  const arrivalISO = new Date(Date.now() + suggestion.totalSeconds * 1000).toISOString();
  const totalMinutes = Math.max(1, Math.round(suggestion.totalSeconds / 60));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(rank * 0.05, 0.3) }}
      className={cn("glass-card p-4", rank === 0 && "ring-2 ring-brand-400")}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-blue text-sm font-bold text-white shadow-glow-blue">
            {suggestion.serviceNo}
          </span>
          <div className="min-w-0">
            {rank === 0 && (
              <span className="mb-0.5 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                {t("trip.fastest")}
              </span>
            )}
            <p className="truncate text-sm font-semibold text-slate-800">
              {t("trip.totalArrival", { minutes: totalMinutes, time: formatClock(arrivalISO) })}
            </p>
            <p className="truncate text-xs text-slate-400">
              {t("trip.viaStops", { count: suggestion.numStops })}
            </p>
          </div>
        </div>
        <AnimatedCountdown etaSeconds={suggestion.boardEtaSeconds} size="sm" />
      </div>

      <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <p className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 shrink-0 text-brand-600" aria-hidden="true" />
          <span className="truncate">
            {t("trip.boardAt", {
              stop: suggestion.boardStop.description,
              distance: formatDistance(suggestion.boardStop.walkMeters),
            })}
          </span>
        </p>
        <p className="flex items-center gap-1.5">
          <Flag className="h-3 w-3 shrink-0 text-brand-600" aria-hidden="true" />
          <span className="truncate">
            {t("trip.alightAt", { stop: suggestion.alightStop.description })}
          </span>
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <OccupancyBadge load={suggestion.load} />
        <WheelchairBadge accessible={suggestion.wheelchairAccessible} />
      </div>
    </motion.div>
  );
}
