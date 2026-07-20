"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  BellRing,
  Construction,
  TimerReset,
  Trash2,
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useArrivalWatcher } from "@/hooks/use-arrival-watcher";
import { useTranslation } from "@/hooks/use-translation";
import { getSampleSystemNotices } from "@/lib/sample-notices";
import { cn } from "@/lib/utils";
import type { AppNotification, NotificationKind } from "@/types/bus";

const KIND_CONFIG: Record<
  NotificationKind,
  { icon: typeof Bell; className: string }
> = {
  arrival: {
    icon: BellRing,
    className: "bg-brand-100 text-brand-700",
  },
  delay: {
    icon: TimerReset,
    className: "bg-amber-100 text-amber-700",
  },
  disruption: {
    icon: AlertTriangle,
    className: "bg-red-100 text-red-700",
  },
  closure: {
    icon: Construction,
    className: "bg-slate-100 text-slate-600",
  },
};

export function NotificationsView() {
  useArrivalWatcher();
  const { notifications, markAllRead, markRead, clear, unreadCount } =
    useNotifications();
  const { t } = useTranslation();

  const sampleNotices = useMemo(() => getSampleSystemNotices(), []);
  const combined: AppNotification[] = [...notifications, ...sampleNotices].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-2xl font-bold text-slate-900"
        >
          {t("nav.notifications")}
        </motion.h1>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs text-brand-600 hover:underline"
            >
              {t("notifications.markAllRead")}
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clear}
              aria-label={t("notifications.clearAria")}
              className="rounded-full p-1.5 text-slate-400 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <p className="mb-4 text-xs text-slate-400">
        {t("notifications.hint")}
      </p>

      {combined.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-2 p-10 text-center">
          <Bell className="h-6 w-6 text-slate-300" aria-hidden="true" />
          <p className="text-sm text-slate-400">{t("notifications.empty")}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {combined.map((notification) => {
            const config = KIND_CONFIG[notification.kind];
            const Icon = config.icon;
            return (
              <motion.li
                key={notification.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "glass-card flex items-start gap-3 p-4",
                  !notification.read && "ring-2 ring-brand-200"
                )}
                onClick={() => markRead(notification.id)}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    config.className
                  )}
                >
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {notification.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {new Date(notification.createdAt).toLocaleString("en-SG", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
                {!notification.read && (
                  <span
                    className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500"
                    aria-hidden="true"
                  />
                )}
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
