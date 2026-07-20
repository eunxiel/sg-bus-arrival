"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Globe } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { LANGUAGE_META } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageMenu({
  className,
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { language, setLanguage, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", showLabel && "flex-1")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("nav.language")}
        aria-expanded={open}
        className={cn(
          showLabel ? "btn-glass w-full py-2.5 text-sm" : "btn-glass h-10 w-10 p-0",
          className
        )}
      >
        <Globe className="h-4.5 w-4.5" aria-hidden="true" />
        {showLabel && t("settings.language")}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="glass-card absolute right-0 top-[calc(100%+0.5rem)] z-50 w-48 bg-white/95 p-2"
          >
            {LANGUAGE_META.map((option) => (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={language === option.value}
                onClick={() => {
                  setLanguage(option.value);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-brand-50"
              >
                {option.nativeLabel}
                {language === option.value && (
                  <Check className="h-4 w-4 text-brand-600" aria-hidden="true" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
