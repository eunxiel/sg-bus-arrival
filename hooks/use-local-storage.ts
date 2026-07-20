"use client";

import { useCallback, useEffect, useState } from "react";

// Each useLocalStorage(key) call gets its own useState, so writes from one
// component instance wouldn't otherwise reach others reading the same key
// (e.g. the language switcher and every component displaying translated
// text). This registry lets a write broadcast to every other instance
// watching the same key within the current tab.
const listeners = new Map<string, Set<(value: unknown) => void>>();

function notify(key: string, value: unknown) {
  listeners.get(key)?.forEach((listener) => listener(value));
}

/**
 * useState-like hook backed by localStorage. SSR-safe: returns the initial
 * value on the server/first render, then syncs from storage after mount.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // ignore malformed storage, keep initial value
    } finally {
      setHydrated(true);
    }

    const listener = (next: unknown) => setValue(next as T);
    const set = listeners.get(key) ?? new Set();
    set.add(listener);
    listeners.set(key, set);
    return () => {
      set.delete(listener);
    };
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // storage may be unavailable (private mode, quota) — fail silently
        }
        notify(key, resolved);
        return resolved;
      });
    },
    [key]
  );

  return [value, update, hydrated] as const;
}
