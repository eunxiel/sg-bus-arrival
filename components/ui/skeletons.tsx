import { getStoredLanguage, translate } from "@/lib/i18n";

export function BusStopCardSkeleton() {
  return (
    <div className="glass-card p-5" aria-hidden="true">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="skeleton h-5 w-3/5" />
          <div className="skeleton h-3.5 w-2/5" />
        </div>
        <div className="skeleton h-8 w-16 rounded-full" />
      </div>
      <div className="mt-4 space-y-3">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-2xl bg-white/40 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="skeleton h-9 w-9 rounded-xl" />
              <div className="space-y-1.5">
                <div className="skeleton h-3.5 w-24" />
                <div className="skeleton h-3 w-16" />
              </div>
            </div>
            <div className="skeleton h-6 w-14 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BusStopListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <BusStopCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TripSuggestionsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="skeleton h-11 w-11 rounded-2xl" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-3.5 w-2/3" />
              <div className="skeleton h-3 w-1/3" />
            </div>
            <div className="skeleton h-8 w-14 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-2 p-2" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl p-3">
          <div className="skeleton h-9 w-9 rounded-xl shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="skeleton h-3.5 w-1/2" />
            <div className="skeleton h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MapSkeleton() {
  const lang = getStoredLanguage();
  const label = translate(lang, "skeleton.loadingMap");
  return (
    <div
      className="skeleton flex h-full w-full items-center justify-center rounded-4xl"
      aria-label={label}
    >
      <span className="text-sm text-slate-400">{label}…</span>
    </div>
  );
}
