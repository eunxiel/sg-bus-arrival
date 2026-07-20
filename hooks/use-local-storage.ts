"use client";

import { useCallback, useEffect, useState } from "react";

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
        return resolved;
      });
    },
    [key]
  );

  return [value, update, hydrated] as const;
}
