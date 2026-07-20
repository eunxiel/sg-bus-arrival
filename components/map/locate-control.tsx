"use client";

import { useMap } from "react-leaflet";
import { LocateFixed } from "lucide-react";
import L from "leaflet";
import { createUserLocationIcon } from "@/lib/map-icons";
import { useTranslation } from "@/hooks/use-translation";
import { useRef } from "react";

export function LocateControl() {
  const map = useMap();
  const { t } = useTranslation();
  const userMarkerRef = useRef<L.Marker | null>(null);

  function handleLocate() {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      map.flyTo([latitude, longitude], 16, { duration: 0.8 });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([latitude, longitude]);
      } else {
        userMarkerRef.current = L.marker([latitude, longitude], {
          icon: createUserLocationIcon(),
          zIndexOffset: 900,
          alt: t("map.yourLocationAlt"),
        }).addTo(map);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleLocate}
      aria-label={t("map.locateMeAria")}
      className="absolute bottom-6 right-4 z-[1000] flex h-11 w-11 items-center justify-center rounded-full glass-pill text-brand-600 shadow-glass-lg transition-transform hover:scale-105"
    >
      <LocateFixed className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
