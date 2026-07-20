"use client";

import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { SearchResult } from "@/types/bus";

const KEY = "sgbus:recent-searches";
const MAX_ITEMS = 8;

export function useRecentSearches() {
  const [recent, setRecent] = useLocalStorage<SearchResult[]>(KEY, []);

  const addRecent = useCallback(
    (result: SearchResult) => {
      setRecent((prev) => {
        const withoutDup = prev.filter((r) => r.id !== result.id);
        return [result, ...withoutDup].slice(0, MAX_ITEMS);
      });
    },
    [setRecent]
  );

  const clearRecent = useCallback(() => setRecent([]), [setRecent]);

  return { recent, addRecent, clearRecent };
}
