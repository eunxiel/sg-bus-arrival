"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

const TRAFFIC_LIGHT_COLORS = [
  "bg-red-500 shadow-[0_0_12px_3px_rgba(239,68,68,0.7)]",
  "bg-yellow-400 shadow-[0_0_12px_3px_rgba(250,204,21,0.7)]",
  "bg-green-500 shadow-[0_0_12px_3px_rgba(34,197,94,0.7)]",
];

function TrafficLight() {
  return (
    <div className="mx-auto mb-4 flex w-fit items-center gap-2.5 rounded-full bg-slate-900/90 px-4 py-2.5 shadow-lg">
      {TRAFFIC_LIGHT_COLORS.map((colorClass, index) => (
        <motion.span
          key={colorClass}
          className={cn("h-3.5 w-3.5 rounded-full", colorClass)}
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.6,
          }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-3xl px-4 pt-10 pb-6 text-center sm:pt-16">
      <TrafficLight />

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="font-heading text-4xl font-extrabold uppercase tracking-tight text-slate-900 sm:text-5xl"
      >
        Singapore Bus Arrival
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-3 text-base text-slate-500 sm:text-lg"
      >
        {t("hero.subtitle")}
      </motion.p>
    </section>
  );
}
