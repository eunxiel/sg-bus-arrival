"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import type { AppSettings } from "@/types/bus";

const KEY = "sgbus:settings";

export const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  refreshIntervalSeconds: 15,
  mapTheme: "light",
};

export function useSettings() {
  const [settings, setSettings, hydrated] = useLocalStorage<AppSettings>(
    KEY,
    DEFAULT_SETTINGS
  );

  function updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return { settings, updateSetting, hydrated };
}
