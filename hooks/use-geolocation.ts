"use client";

import { useCallback, useState } from "react";

export interface GeoCoords {
  lat: number;
  lng: number;
}

interface GeolocationState {
  coords: GeoCoords | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

// Fallback: Singapore city centre (Raffles Place), used if geolocation is
// unavailable or denied so the app still has something sensible to show.
export const SINGAPORE_FALLBACK_COORDS: GeoCoords = { lat: 1.2839, lng: 103.8515 };

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    loading: false,
    error: null,
    permissionDenied: false,
  });

  const locate = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setState({
        coords: SINGAPORE_FALLBACK_COORDS,
        loading: false,
        error: "Geolocation is not supported by this browser.",
        permissionDenied: false,
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          loading: false,
          error: null,
          permissionDenied: false,
        });
      },
      (error) => {
        setState({
          coords: SINGAPORE_FALLBACK_COORDS,
          loading: false,
          error: error.message,
          permissionDenied: error.code === error.PERMISSION_DENIED,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { ...state, locate };
}
