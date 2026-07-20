"use client";

import { useSettings } from "@/hooks/use-settings";
import { translate } from "@/lib/i18n";

export function useTranslation() {
  const { settings, updateSetting } = useSettings();

  function t(key: string, params?: Record<string, string | number>): string {
    return translate(settings.language, key, params);
  }

  return {
    t,
    language: settings.language,
    setLanguage: (lang: typeof settings.language) => updateSetting("language", lang),
  };
}
