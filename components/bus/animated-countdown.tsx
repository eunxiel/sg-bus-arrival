"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { cn, formatCountdown } from "@/lib/utils";

interface AnimatedCountdownProps {
  etaSeconds: number | null;
  size?: "sm" | "lg";
}

/**
 * Ticks down locally between refetches so the countdown feels live, while
 * still being corrected to the server value whenever new data arrives.
 */
export function AnimatedCountdown({ etaSeconds, size = "sm" }: AnimatedCountdownProps) {
  const { t } = useTranslation();
  const [localSeconds, setLocalSeconds] = useState(etaSeconds);

  useEffect(() => {
    setLocalSeconds(etaSeconds);
  }, [etaSeconds]);

  useEffect(() => {
    if (localSeconds === null) return;
    const interval = setInterval(() => {
      setLocalSeconds((prev) => (prev === null ? null : Math.max(0, prev - 1)));
    }, 1000);
    return () => clearInterval(interval);
    // Intentionally re-subscribed only when transitioning to/from null so the
    // ticking interval doesn't restart every second from its own updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSeconds === null]);

  const label = formatCountdown(localSeconds, {
    arriving: t("common.arriving"),
    minute: t("common.minute"),
  });
  const isArriving = localSeconds !== null && localSeconds <= 60;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl font-semibold tabular-nums",
        size === "sm" ? "min-w-[3.25rem] px-2 py-1.5 text-sm" : "min-w-[5rem] px-4 py-3 text-2xl",
        isArriving
          ? "bg-gradient-blue text-white shadow-glow-blue"
          : "bg-white/70 text-slate-700"
      )}
      role="status"
      aria-live="polite"
      aria-label={
        localSeconds === null
          ? t("countdown.unavailable")
          : t("countdown.arrivingIn", { time: label })
      }
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={label}
          initial={{ opacity: 0, y: size === "sm" ? 6 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: size === "sm" ? -6 : -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
