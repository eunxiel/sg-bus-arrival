"use client";

import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { AppNotification, NotificationKind } from "@/types/bus";

const KEY = "sgbus:notifications";
const MAX_ITEMS = 30;

export function useNotifications() {
  const [notifications, setNotifications] = useLocalStorage<AppNotification[]>(
    KEY,
    []
  );

  const push = useCallback(
    (input: {
      kind: NotificationKind;
      title: string;
      message: string;
      busStopCode?: string;
      serviceNo?: string;
    }) => {
      setNotifications((prev) => {
        const notification: AppNotification = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
          read: false,
          ...input,
        };
        return [notification, ...prev].slice(0, MAX_ITEMS);
      });
    },
    [setNotifications]
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [setNotifications]);

  const markRead = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    },
    [setNotifications]
  );

  const clear = useCallback(() => setNotifications([]), [setNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, push, markAllRead, markRead, clear, unreadCount };
}
