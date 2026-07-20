"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, Locate, MapPin, Search, ShoppingBag, X } from "lucide-react";
import { apiGet } from "@/lib/api-client";
import { debounce, cn } from "@/lib/utils";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useTranslation } from "@/hooks/use-translation";
import type { SearchResult, SearchResultKind } from "@/types/bus";

export interface Place {
  label: string;
  lat: number;
  lng: number;
}

interface SearchApiResponse {
  results: SearchResult[];
}

const KIND_ICON: Partial<Record<SearchResultKind, typeof MapPin>> = {
  bus_stop: MapPin,
  mrt_station: Landmark,
  mall: ShoppingBag,
};

interface PlaceInputProps {
  icon: typeof MapPin;
  placeholder: string;
  value: Place | null;
  onSelect: (place: Place | null) => void;
  allowCurrentLocation?: boolean;
}

export function PlaceInput({
  icon: Icon,
  placeholder,
  value,
  onSelect,
  allowCurrentLocation = false,
}: PlaceInputProps) {
  const { t } = useTranslation();
  const { locate, coords, loading: locating } = useGeolocation();
  const [query, setQuery] = useState(value?.label ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCurrentLocation = useRef(false);
  const [anchorRect, setAnchorRect] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    setQuery(value?.label ?? "");
  }, [value]);

  const setDebounced = useMemo(
    () => debounce((v: string) => setDebouncedQuery(v), 250),
    []
  );

  useEffect(() => {
    setDebounced(query);
  }, [query, setDebounced]);

  const { data, isFetching } = useQuery({
    queryKey: ["place-search", debouncedQuery],
    queryFn: () => apiGet<SearchApiResponse>("/api/search", { q: debouncedQuery }),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 30_000,
  });

  const results = (data?.results ?? []).filter((r) => r.kind !== "bus_service");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const insideAnchor = containerRef.current?.contains(target) ?? false;
      const insideDropdown = dropdownRef.current?.contains(target) ?? false;
      if (!insideAnchor && !insideDropdown) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function updateRect() {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      setAnchorRect({ top: r.bottom + 8, left: r.left, width: r.width });
    }
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (coords && locating === false && pendingCurrentLocation.current) {
      pendingCurrentLocation.current = false;
      onSelect({ label: t("trip.currentLocation"), lat: coords.lat, lng: coords.lng });
      setIsOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, locating]);

  function handleUseCurrentLocation() {
    pendingCurrentLocation.current = true;
    locate();
  }

  function handleSelectResult(result: SearchResult) {
    if (result.latitude == null || result.longitude == null) return;
    onSelect({ label: result.title, lat: result.latitude, lng: result.longitude });
    setQuery(result.title);
    setIsOpen(false);
  }

  function handleClear() {
    setQuery("");
    onSelect(null);
  }

  const showDropdown = isOpen && (query.trim().length > 0 || allowCurrentLocation);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="glass-search-bar gap-2 px-4 h-12 text-sm">
        <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSelect(null);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent text-base text-slate-800 placeholder:text-slate-400 focus:outline-none sm:text-sm"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={t("search.clearAria")}
            className="shrink-0 rounded-full p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {typeof document !== "undefined" &&
        anchorRect &&
        createPortal(
          <AnimatePresence>
            {showDropdown && (
              <>
                <motion.div
                  key="place-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-40 bg-white/50 backdrop-blur-sm"
                  onClick={() => setIsOpen(false)}
                  aria-hidden="true"
                />
                <motion.div
                  key="place-panel"
                  ref={dropdownRef}
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
                  className="glass-search-panel z-50 max-h-80 overflow-y-auto p-2"
                >
                  {allowCurrentLocation && query.trim().length === 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => inputRef.current?.focus()}
                        className="flex w-full items-center gap-3 rounded-2xl p-3 text-left text-slate-400 transition-colors hover:bg-brand-50"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                          <Search className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="text-sm font-medium">
                          {t("trip.searchHint")}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={locating}
                        className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-brand-50 disabled:opacity-60"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-blue text-white">
                          <Locate className={cn("h-4 w-4", locating && "animate-pulse")} aria-hidden="true" />
                        </span>
                        <span className="text-sm font-medium text-slate-800">
                          {locating ? t("hero.findingLocation") : t("common.useCurrentLocation")}
                        </span>
                      </button>
                    </>
                  )}

                  {query.trim().length > 0 && isFetching && (
                    <p className="p-4 text-center text-sm text-slate-400">{t("search.searching")}</p>
                  )}

                  {query.trim().length > 0 && !isFetching && results.length === 0 && (
                    <p className="p-4 text-center text-sm text-slate-400">
                      {t("search.noMatches", { query })}
                    </p>
                  )}

                  {query.trim().length > 0 &&
                    !isFetching &&
                    results.map((result) => {
                      const ResultIcon = KIND_ICON[result.kind] ?? MapPin;
                      return (
                        <button
                          key={result.id}
                          type="button"
                          role="option"
                          aria-selected={false}
                          onClick={() => handleSelectResult(result)}
                          className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-brand-50"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                            <ResultIcon className="h-4 w-4" aria-hidden="true" />
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
                    })}
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
