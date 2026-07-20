"use client";

import { motion } from "framer-motion";
import { Globe, Map, RefreshCw } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useTranslation } from "@/hooks/use-translation";
import { LANGUAGE_META } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { MapTheme } from "@/types/bus";

const REFRESH_OPTIONS = [10, 15, 30, 60];

export function SettingsView() {
  const { settings, updateSetting } = useSettings();
  const { t } = useTranslation();

  const MAP_THEME_OPTIONS: { value: MapTheme; label: string }[] = [
    { value: "light", label: t("settings.mapLight") },
    { value: "dark", label: t("settings.mapDark") },
    { value: "satellite", label: t("settings.mapSatellite") },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-heading text-2xl font-bold text-slate-900"
      >
        {t("settings.title")}
      </motion.h1>

      <SettingSection icon={Globe} title={t("settings.language")}>
        <SegmentedControl
          options={LANGUAGE_META.map((l) => ({ value: l.value, label: l.nativeLabel }))}
          value={settings.language}
          onChange={(value) => updateSetting("language", value)}
        />
      </SettingSection>

      <SettingSection icon={RefreshCw} title={t("settings.refreshInterval")}>
        <div className="flex flex-wrap gap-2">
          {REFRESH_OPTIONS.map((seconds) => (
            <button
              key={seconds}
              type="button"
              onClick={() => updateSetting("refreshIntervalSeconds", seconds)}
              aria-pressed={settings.refreshIntervalSeconds === seconds}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                settings.refreshIntervalSeconds === seconds
                  ? "bg-gradient-blue text-white shadow-glow-blue"
                  : "bg-white/60 text-slate-600 hover:bg-white/90"
              )}
            >
              {seconds}s
            </button>
          ))}
        </div>
      </SettingSection>

      <SettingSection icon={Map} title={t("settings.mapStyle")}>
        <SegmentedControl
          options={MAP_THEME_OPTIONS}
          value={settings.mapTheme}
          onChange={(value) => updateSetting("mapTheme", value)}
        />
      </SettingSection>
    </div>
  );
}

function SettingSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Globe;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5"
      aria-labelledby={`section-${title}`}
    >
      <h2
        id={`section-${title}`}
        className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800"
      >
        <Icon className="h-4 w-4 text-brand-600" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      className="flex flex-wrap gap-2 rounded-full bg-slate-100/70 p-1 sm:inline-flex"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            value === option.value
              ? "bg-white text-brand-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
