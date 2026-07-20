"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Bus } from "lucide-react";
import { SearchBar } from "@/components/search/search-bar";
import { LanguageMenu } from "@/components/layout/language-menu";
import { useNotifications } from "@/hooks/use-notifications";
import { useTranslation } from "@/hooks/use-translation";

export function Navbar() {
  const { unreadCount } = useNotifications();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 w-full px-3 pt-3 sm:px-4 sm:pt-4">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel mx-auto flex max-w-6xl items-center gap-3 rounded-4xl px-4 py-2.5 sm:px-5"
      >
        <Link
          href="/"
          className="font-heading flex shrink-0 items-center gap-2 font-semibold text-slate-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-blue text-white shadow-glow-blue">
            <Bus className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="hidden text-base sm:inline">SG Bus Arrival</span>
        </Link>

        <div className="min-w-0 flex-1">
          <SearchBar />
        </div>

        <LanguageMenu className="shrink-0" />

        <Link
          href="/notifications"
          aria-label={
            t("nav.notifications") +
            (unreadCount > 0 ? t("nav.unreadSuffix", { count: unreadCount }) : "")
          }
          className="btn-glass relative h-10 w-10 shrink-0 p-0"
        >
          <Bell className="h-4.5 w-4.5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </motion.div>
    </header>
  );
}
