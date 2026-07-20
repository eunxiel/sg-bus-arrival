import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const EARTH_RADIUS_METERS = 6371000;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Haversine great-circle distance between two lat/lng points, in meters. */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/** Formats seconds-until-arrival into a short human label, e.g. "3 min", "Arr", "12 min". */
export function formatCountdown(
  seconds: number | null,
  labels: { arriving: string; minute: string } = { arriving: "Arr", minute: "min" }
): string {
  if (seconds === null) return "--";
  if (seconds <= 30) return labels.arriving;
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return labels.arriving;
  return `${minutes} ${labels.minute}`;
}

export function formatClock(isoString: string | null): string {
  if (!isoString) return "--:--";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "--:--";
  return d.toLocaleTimeString("en-SG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Parses an LTA HHmm string (e.g. "0530") into a readable time "05:30". */
export function formatHHmm(hhmm: string): string {
  if (!hhmm || hhmm.length < 4) return "--:--";
  return `${hhmm.slice(0, 2)}:${hhmm.slice(2, 4)}`;
}

export function secondsUntil(isoString: string | null): number | null {
  if (!isoString) return null;
  const target = new Date(isoString).getTime();
  if (Number.isNaN(target)) return null;
  const diff = Math.floor((target - Date.now()) / 1000);
  return diff < 0 ? 0 : diff;
}

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  waitMs: number
): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), waitMs);
  };
}

export function operatorFullName(code: string): string {
  const map: Record<string, string> = {
    SBST: "SBS Transit",
    SMRT: "SMRT Buses",
    TTS: "Tower Transit",
    GAS: "Go-Ahead Singapore",
  };
  return map[code] ?? code;
}
