"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TrainFront, X } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function MrtMapLauncher() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glass-card-hover flex w-full items-center justify-center gap-2 p-4 text-sm font-medium text-slate-700"
      >
        <TrainFront className="h-4 w-4 text-brand-600" aria-hidden="true" />
        {t("mrtMap.cta")}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="glass-search-panel relative max-h-[85vh] w-full max-w-3xl overflow-auto p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="font-heading text-sm font-semibold text-slate-900">
                  {t("mrtMap.title")}
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("mrtMap.closeAria")}
                  className="btn-glass h-8 w-8 shrink-0 p-0"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/mrt-map.jpg"
                alt={t("mrtMap.title")}
                className="w-full rounded-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
