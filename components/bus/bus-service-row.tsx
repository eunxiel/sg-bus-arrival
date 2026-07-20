"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bus, Heart, Bus as BusFront } from "lucide-react";
import { AnimatedCountdown } from "@/components/bus/animated-countdown";
import {
  AirConBadge,
  DeckTypeBadge,
  OccupancyBadge,
  WheelchairBadge,
} from "@/components/bus/service-badges";
import { useTranslation } from "@/hooks/use-translation";
import { cn, formatCountdown } from "@/lib/utils";
import type { BusServiceArrival } from "@/types/bus";

interface BusServiceRowProps {
  busStopCode: string;
  service: BusServiceArrival;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function BusServiceRow({
  busStopCode,
  service,
  isFavorite,
  onToggleFavorite,
}: BusServiceRowProps) {
  const { t } = useTranslation();
  const { next, next2, next3 } = service;
  const hasArrival = next.etaSeconds !== null;
  const countdownLabels = { arriving: t("common.arriving"), minute: t("common.minute") };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-white/50 p-3 transition-colors hover:bg-white/75"
    >
      <div className="flex items-center gap-3">
        <Link
          href={`/bus/${service.serviceNo}?busStopCode=${busStopCode}`}
          className="flex flex-1 items-center gap-3 min-w-0"
          aria-label={t("serviceRow.viewDetailsAria", { serviceNo: service.serviceNo })}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-blue text-white font-bold text-sm shadow-sm">
            {service.serviceNo}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 text-sm font-semibold text-slate-800">
                {t("common.busLabel", { serviceNo: service.serviceNo })}
              </span>
              <span className="shrink-0">
                <DeckTypeBadge type={next.busType} />
              </span>
              <span className="min-w-0 flex-1 truncate text-[11px] text-slate-400">
                {service.operatorFullName}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              {next.monitored && <AirConBadge />}
              <WheelchairBadge accessible={next.wheelchairAccessible} />
              <OccupancyBadge load={next.load} />
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-pressed={isFavorite}
              aria-label={
                isFavorite
                  ? t("serviceRow.removeFavAria", { serviceNo: service.serviceNo })
                  : t("serviceRow.addFavAria", { serviceNo: service.serviceNo })
              }
              className="rounded-full p-1.5 text-slate-400 transition-colors hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            >
              <Heart
                className={cn("h-4 w-4", isFavorite && "fill-red-500 text-red-500")}
                aria-hidden="true"
              />
            </button>
          )}
          <AnimatedCountdown etaSeconds={next.etaSeconds} />
        </div>
      </div>

      {hasArrival && (
        <div className="mt-2 flex items-center gap-4 pl-[3.25rem] text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <BusFront className="h-3 w-3" aria-hidden="true" />
            {t("serviceRow.next", { time: formatCountdown(next2.etaSeconds, countdownLabels) })}
          </span>
          <span className="flex items-center gap-1">
            <Bus className="h-3 w-3" aria-hidden="true" />
            {t("serviceRow.after", { time: formatCountdown(next3.etaSeconds, countdownLabels) })}
          </span>
        </div>
      )}

      {!hasArrival && (
        <p className="mt-2 pl-[3.25rem] text-xs text-slate-400">
          {t("serviceRow.noArrival")}
        </p>
      )}
    </motion.div>
  );
}
