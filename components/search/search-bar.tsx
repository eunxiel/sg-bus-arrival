"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Bus, Clock, Landmark, MapPin, Search, ShoppingBag, X } from "lucide-react";
import { apiGet } from "@/lib/api-client";
import { debounce, cn } from "@/lib/utils";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { useTranslation } from "@/hooks/use-translation";
import { SearchResultsSkeleton } from "@/components/ui/skeletons";
import type { SearchResult, SearchResultKind } from "@/types/bus";

interface SearchApiResponse {
  results: SearchResult[];
}

const KIND_ICON: Record<SearchResultKind, typeof Bus> = {
  bus_service: Bus,
  bus_stop: MapPin,
  mrt_station: Landmark,
  mall: ShoppingBag,
};

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  variant?: "hero" | "compact";
}

export function SearchBar({
  placeholder,
  autoFocus = false,
  variant = "compact",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [anchorRect, setAnchorRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const { recent, addRecent, clearRecent } = useRecentSearches();
  const { t } = useTranslation();
  const effectivePlaceholder = placeholder ?? t("search.placeholder");

  const setDebounced = useMemo(
    () => debounce((value: string) => setDebouncedQuery(value), 250),
    []
  );

  useEffect(() => {
    setDebounced(query);
  }, [query, setDebounced]);

  const { data, isFetching } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => apiGet<SearchApiResponse>("/api/search", { q: debouncedQuery }),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 30_000,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const insideAnchor = containerRef.current?.contains(target) ?? false;
      const insideDropdown = dropdownRef.current?.contains(target) ?? false;
      if (!insideAnchor && !insideDropdown) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function updateRect() {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      const margin = 12;
      const viewportWidth = window.innerWidth;
      // The anchor (search input) can be squeezed quite narrow next to the
      // other navbar icons, which would truncate result titles/subtitles.
      // Widen the dropdown past the anchor's own width when needed, capped
      // to the viewport, and keep it within bounds horizontally.
      const width = Math.max(r.width, Math.min(340, viewportWidth - margin * 2));
      const left = Math.min(
        Math.max(r.left, margin),
        viewportWidth - width - margin
      );
      setAnchorRect({ top: r.bottom + 8, left, width });
    }

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isOpen]);

  function handleSelect(result: SearchResult) {
    addRecent(result);
    setIsOpen(false);
    setQuery("");

    if (result.kind === "bus_service") {
      router.push(`/bus/${result.serviceNo}`);
    } else if (
      result.kind === "bus_stop" &&
      result.busStopCode &&
      result.latitude &&
      result.longitude
    ) {
      router.push(
        `/?lat=${result.latitude}&lng=${result.longitude}&stop=${result.busStopCode}`
      );
    } else if (result.latitude && result.longitude) {
      router.push(`/?lat=${result.latitude}&lng=${result.longitude}`);
    }
  }

  const showResults = isOpen && query.trim().length > 0;
  const showRecent = isOpen && query.trim().length === 0 && recent.length > 0;
  const results = data?.results ?? [];

  function handleSubmit() {
    if (results.length > 0) {
      handleSelect(results[0]);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={cn(
          "glass-search-bar gap-2 px-4",
          variant === "hero" ? "h-14 text-base" : "h-11 text-sm"
        )}
      >
        <Search
          className={cn(
            "shrink-0 text-slate-400",
            variant === "hero" ? "h-5 w-5" : "h-4 w-4"
          )}
          aria-hidden="true"
        />
        <input
          type="search"
          role="combobox"
          aria-expanded={showResults || showRecent}
          aria-controls="search-results-listbox"
          aria-autocomplete="list"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          placeholder={effectivePlaceholder}
          className="w-full bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={t("search.clearAria")}
            className="shrink-0 rounded-full p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        {variant === "hero" && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={results.length === 0}
            aria-label={t("search.submitAria")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-blue text-white shadow-glow-blue transition-transform duration-200 ease-out hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {typeof document !== "undefined" &&
        anchorRect &&
        createPortal(
          <AnimatePresence>
            {(showResults || showRecent) && (
              <>
                <motion.div
                  key="search-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-40 bg-white/50 backdrop-blur-sm"
                  onClick={() => setIsOpen(false)}
                  aria-hidden="true"
                />
                <motion.div
                  key="search-panel"
                  ref={dropdownRef}
                  id="search-results-listbox"
                  role="listbox"
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  style={{
                    position: "fixed",
                    top: anchorRect.top,
                    left: anchorRect.left,
                    width: anchorRect.width,
                  }}
                  className="glass-search-panel z-50 max-h-96 overflow-y-auto p-2"
                >
                  {showRecent && (
                    <div>
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          {t("search.recentSearches")}
                        </span>
                        <button
                          type="button"
                          onClick={clearRecent}
                          className="text-xs text-brand-600 hover:underline"
                        >
                          {t("search.clear")}
                        </button>
                      </div>
                      {recent.map((result) => (
                        <SearchResultItem
                          key={result.id}
                          result={result}
                          onSelect={handleSelect}
                          icon={Clock}
                        />
                      ))}
                    </div>
                  )}

                  {showResults && isFetching && <SearchResultsSkeleton />}

                  {showResults && !isFetching && results.length === 0 && (
                    <p className="p-4 text-center text-sm text-slate-400">
                      {t("search.noMatches", { query })}
                    </p>
                  )}

                  {showResults &&
                    !isFetching &&
                    results.map((result) => (
                      <SearchResultItem
                        key={result.id}
                        result={result}
                        onSelect={handleSelect}
                        icon={KIND_ICON[result.kind]}
                      />
                    ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

function SearchResultItem({
  result,
  onSelect,
  icon: Icon,
}: {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
  icon: typeof Bus;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={false}
      onClick={() => onSelect(result)}
      className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-brand-50"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-800">
          {result.title}
        </span>
        <span className="block truncate text-xs text-slate-400">
          {result.subtitle}
        </span>
      </span>
    </button>
  );
}
