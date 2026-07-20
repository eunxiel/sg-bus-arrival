"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { createBusIcon } from "@/lib/map-icons";

interface AnimatedBusMarkerProps {
  latitude: number;
  longitude: number;
  label: string;
}

const ANIMATION_DURATION_MS = 900;

function bearingBetween(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Smoothly interpolates the bus marker's screen position between the last
 * known and newly-received coordinates, rather than snapping, so the marker
 * reads as "moving" rather than teleporting on each 15s refetch.
 */
export function AnimatedBusMarker({
  latitude,
  longitude,
  label,
}: AnimatedBusMarkerProps) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const prevPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const marker = L.marker([latitude, longitude], {
      icon: createBusIcon(0),
      zIndexOffset: 1000,
      alt: label,
    });
    marker.addTo(map);
    markerRef.current = marker;
    prevPositionRef.current = { lat: latitude, lng: longitude };

    return () => {
      marker.remove();
      markerRef.current = null;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    const marker = markerRef.current;
    const prev = prevPositionRef.current;
    if (!marker || !prev) return;

    const from = { ...prev };
    const to = { lat: latitude, lng: longitude };
    const bearing = bearingBetween(from.lat, from.lng, to.lat, to.lng);
    const startTime = performance.now();

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    function step(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / ANIMATION_DURATION_MS);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic

      const lat = from.lat + (to.lat - from.lat) * eased;
      const lng = from.lng + (to.lng - from.lng) * eased;
      marker?.setLatLng([lat, lng]);
      marker?.setIcon(createBusIcon(bearing));

      if (t < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        prevPositionRef.current = to;
      }
    }

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [latitude, longitude]);

  return null;
}
