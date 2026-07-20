"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bus, Clock, Heart, MapPin, Trash2 } from "lucide-react";
import { useFavoriteServices, useFavoriteStops } from "@/hooks/use-favorites";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { useTranslation } from "@/hooks/use-translation";

export function FavoritesView() {
  const { stops, toggle: toggleStop } = useFavoriteStops();
  const { services, toggle: toggleService } = useFavoriteServices();
  const { recent, clearRecent } = useRecentSearches();
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-heading text-2xl font-bold text-slate-900"
      >
        {t("favorites.title")}
      </motion.h1>

      <section aria-labelledby="fav-stops-heading">
        <h2
          id="fav-stops-heading"
          className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-800"
        >
          <MapPin className="h-4 w-4 text-brand-600" aria-hidden="true" />
          {t("favorites.savedStops")}
        </h2>
        {stops.length === 0 ? (
          <EmptyState label={t("favorites.noStops")} />
        ) : (
          <ul className="space-y-2">
            {stops.map((stop) => (
              <li
                key={stop.busStopCode}
                className="glass-card flex items-center justify-between gap-3 p-4"
              >
                <Link
                  href={`/?stop=${stop.busStopCode}`}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-sm font-medium text-slate-800">
                    {stop.description}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {stop.roadName} · {stop.busStopCode}
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    toggleStop({
                      busStopCode: stop.busStopCode,
                      description: stop.description,
                      roadName: stop.roadName,
                    })
                  }
                  aria-label={t("stopCard.removeFavAria", { name: stop.description })}
                  className="rounded-full p-2 text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="fav-services-heading">
        <h2
          id="fav-services-heading"
          className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-800"
        >
          <Bus className="h-4 w-4 text-brand-600" aria-hidden="true" />
          {t("favorites.savedServices")}
        </h2>
        {services.length === 0 ? (
          <EmptyState label={t("favorites.noServices")} />
        ) : (
          <ul className="space-y-2">
            {services.map((service) => (
              <li
                key={`${service.serviceNo}-${service.busStopCode}`}
                className="glass-card flex items-center justify-between gap-3 p-4"
              >
                <Link
                  href={`/bus/${service.serviceNo}?busStopCode=${service.busStopCode}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-blue text-xs font-bold text-white">
                    {service.serviceNo}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-800">
                      {t("common.busLabel", { serviceNo: service.serviceNo })}
                    </span>
                    <span className="block truncate text-xs text-slate-400">
                      {t("favorites.fromStop", { stop: service.stopDescription })}
                    </span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => toggleService(service)}
                  aria-label={t("serviceRow.removeFavAria", { serviceNo: service.serviceNo })}
                  className="rounded-full p-2 text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="recent-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2
            id="recent-heading"
            className="flex items-center gap-2 text-base font-semibold text-slate-800"
          >
            <Clock className="h-4 w-4 text-brand-600" aria-hidden="true" />
            {t("favorites.recentSearches")}
          </h2>
          {recent.length > 0 && (
            <button
              type="button"
              onClick={clearRecent}
              className="text-xs text-brand-600 hover:underline"
            >
              {t("favorites.clearAll")}
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <EmptyState label={t("favorites.noRecent")} />
        ) : (
          <ul className="space-y-2">
            {recent.map((result) => (
              <li key={result.id} className="glass-card p-4">
                <p className="truncate text-sm font-medium text-slate-800">
                  {result.title}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {result.subtitle}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="glass-card flex flex-col items-center gap-2 p-8 text-center">
      <Heart className="h-6 w-6 text-slate-300" aria-hidden="true" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}
