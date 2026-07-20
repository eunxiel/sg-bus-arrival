import { Accessibility, Snowflake, Users } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import type { BusLoad, BusType } from "@/types/bus";

const LOAD_CONFIG: Record<BusLoad, { labelKey: string; shortKey: string; className: string }> = {
  seats_available: {
    labelKey: "badge.seatsAvailable",
    shortKey: "badge.seatsShort",
    className: "bg-emerald-100 text-emerald-700",
  },
  standing_available: {
    labelKey: "badge.standingAvailable",
    shortKey: "badge.standingShort",
    className: "bg-amber-100 text-amber-700",
  },
  limited_standing: {
    labelKey: "badge.limitedStanding",
    shortKey: "badge.limitedShort",
    className: "bg-red-100 text-red-700",
  },
  unknown: {
    labelKey: "badge.occupancyUnknown",
    shortKey: "badge.naShort",
    className: "bg-slate-100 text-slate-500",
  },
};

export function OccupancyBadge({ load }: { load: BusLoad }) {
  const { t } = useTranslation();
  const config = LOAD_CONFIG[load];
  const label = t(config.labelKey);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        config.className
      )}
      title={label}
    >
      <Users className="h-3 w-3" aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">{t(config.shortKey)}</span>
    </span>
  );
}

export function WheelchairBadge({ accessible }: { accessible: boolean }) {
  const { t } = useTranslation();
  if (!accessible) return null;
  const label = t("badge.wheelchairAccessible");
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-brand-100 p-1 text-brand-700"
      title={label}
    >
      <Accessibility className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function DeckTypeBadge({ type }: { type: BusType }) {
  const { t } = useTranslation();
  if (type === "unknown") return null;
  const label =
    type === "double_deck"
      ? t("badge.doubleDeck")
      : type === "bendy"
      ? t("badge.bendy")
      : t("badge.singleDeck");
  return (
    <span
      className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
      title={label}
    >
      {type === "double_deck" ? "DD" : type === "bendy" ? "BD" : "SD"}
    </span>
  );
}

export function AirConBadge() {
  const { t } = useTranslation();
  const label = t("badge.airConditioned");
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-sky-100 p-1 text-sky-700"
      title={label}
    >
      <Snowflake className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
