"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Clock,
  Map as MapIcon,
  Radio,
  Timer,
} from "lucide-react";
import { useBusServiceInfo, useBusRoute } from "@/hooks/use-bus-route";
import { useBusArrival } from "@/hooks/use-bus-arrival";
import { useSettings } from "@/hooks/use-settings";
import { useTranslation } from "@/hooks/use-translation";
import { AnimatedCountdown } from "@/components/bus/animated-countdown";
import {
  AirConBadge,
  DeckTypeBadge,
  OccupancyBadge,
  WheelchairBadge,
} from "@/components/bus/service-badges";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { cn, formatClock, formatHHmm } from "@/lib/utils";
import { currentDayType, getServiceStatus } from "@/lib/service-status";

interface BusDetailsViewProps {
  serviceNo: string;
  busStopCode: string | null;
}

const STATUS_KEY: Record<string, string> = {
  schedule_unavailable: "status.scheduleUnavailable",
  not_in_operation: "status.notInOperation",
  ending_soon: "status.endingSoon",
  in_operation: "status.inOperation",
};

export function BusDetailsView({ serviceNo, busStopCode }: BusDetailsViewProps) {
  const { settings } = useSettings();
  const { t } = useTranslation();
  const { data: serviceInfoData, isLoading: infoLoading } =
    useBusServiceInfo(serviceNo);
  const { data: routeData, isLoading: routeLoading } = useBusRoute(serviceNo);
  const { data: arrivalData } = useBusArrival(
    busStopCode,
    settings.refreshIntervalSeconds
  );

  const serviceInfo = serviceInfoData?.services?.[0];
  const arrival = arrivalData?.services.find((s) => s.serviceNo === serviceNo);
  const routeStops = routeData?.route ?? [];
  const firstStop = routeStops[0];
  const lastStop = routeStops[routeStops.length - 1];

  const dayType = currentDayType();
  const status = firstStop
    ? getServiceStatus(
        dayType === "weekday"
          ? firstStop.firstBusWeekday
          : dayType === "saturday"
          ? firstStop.firstBusSaturday
          : firstStop.firstBusSunday,
        dayType === "weekday"
          ? firstStop.lastBusWeekday
          : dayType === "saturday"
          ? firstStop.lastBusSaturday
          : firstStop.lastBusSunday
      )
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("details.backToHome")}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card mt-4 p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-blue text-2xl font-bold text-white shadow-glow-blue">
              {serviceNo}
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-slate-900">
                {t("common.busLabel", { serviceNo })}
              </h1>
              {serviceInfo && (
                <p className="text-sm text-slate-500">
                  {serviceInfo.category} · {serviceInfo.operator}
                </p>
              )}
              {status && (
                <span
                  className={cn(
                    "mt-1 inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
                    status.status === "in_operation" &&
                      "bg-emerald-100 text-emerald-700",
                    status.status === "ending_soon" &&
                      "bg-amber-100 text-amber-700",
                    (status.status === "not_in_operation" ||
                      status.status === "schedule_unavailable") &&
                      "bg-slate-100 text-slate-500"
                  )}
                >
                  <Radio className="h-3 w-3" aria-hidden="true" />
                  {t(STATUS_KEY[status.status])}
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/route/${serviceNo}`}
            className="btn-primary shrink-0 px-4 py-2.5 text-sm"
          >
            <MapIcon className="h-4 w-4" aria-hidden="true" />
            {t("details.viewRoute")}
          </Link>
        </div>

        {busStopCode && arrival && (
          <div className="mt-6 rounded-3xl bg-white/50 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
              {t("details.liveArrivals", { code: busStopCode })}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: t("details.currentEta"), arrival: arrival.next },
                { label: t("details.nextEta"), arrival: arrival.next2 },
                { label: t("details.followingEta"), arrival: arrival.next3 },
              ].map(({ label, arrival: a }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white/60 p-3 text-center"
                >
                  <span className="text-[11px] text-slate-400">{label}</span>
                  <AnimatedCountdown etaSeconds={a.etaSeconds} size="lg" />
                  <span className="text-[11px] text-slate-400">
                    {formatClock(a.etaISO)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <OccupancyBadge load={arrival.next.load} />
              <WheelchairBadge accessible={arrival.next.wheelchairAccessible} />
              <DeckTypeBadge type={arrival.next.busType} />
              {arrival.next.monitored && <AirConBadge />}
            </div>
          </div>
        )}

        {!busStopCode && (
          <p className="mt-6 rounded-2xl bg-slate-50 p-3 text-sm text-slate-500">
            {t("details.openFromStop")}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card mt-4 grid grid-cols-2 gap-4 p-6 sm:grid-cols-4"
      >
        <InfoTile
          icon={Building2}
          label={t("details.operator")}
          value={serviceInfo?.operator ?? "—"}
          loading={infoLoading}
        />
        <InfoTile
          icon={Clock}
          label={t("details.firstBus")}
          value={firstStop ? formatHHmm(firstStop.firstBusWeekday) : "—"}
          loading={routeLoading}
        />
        <InfoTile
          icon={Clock}
          label={t("details.lastBus")}
          value={lastStop ? formatHHmm(lastStop.lastBusWeekday) : "—"}
          loading={routeLoading}
        />
        <InfoTile
          icon={Timer}
          label={t("details.amPeakFreq")}
          value={serviceInfo?.amPeakFreq ? `${serviceInfo.amPeakFreq} ${t("common.minute")}` : "—"}
          loading={infoLoading}
        />
      </motion.div>

      <ErrorBoundary fallbackTitle={t("details.routeSummaryError")}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="glass-card mt-4 p-6"
        >
          <h2 className="font-heading mb-3 text-base font-semibold text-slate-900">
            {t("details.routeSummary")}
          </h2>
          {routeLoading && (
            <div className="skeleton h-24 w-full" />
          )}
          {!routeLoading && routeStops.length > 0 && (
            <p className="text-sm text-slate-500">
              {t("details.stopsFromPrefix", { count: routeStops.length })}{" "}
              <span className="font-medium text-slate-700">
                {firstStop?.stop?.description ?? firstStop?.busStopCode}
              </span>{" "}
              {t("details.stopsTo")}{" "}
              <span className="font-medium text-slate-700">
                {lastStop?.stop?.description ?? lastStop?.busStopCode}
              </span>
              . {t("details.stopsSuffix")}
            </p>
          )}
          {!routeLoading && routeStops.length === 0 && (
            <p className="text-sm text-slate-400">{t("details.routeUnavailable")}</p>
          )}
        </motion.div>
      </ErrorBoundary>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="text-[11px] text-slate-400">{label}</span>
      {loading ? (
        <span className="skeleton h-4 w-14" />
      ) : (
        <span className="text-sm font-semibold text-slate-800">
          {value}
        </span>
      )}
    </div>
  );
}
