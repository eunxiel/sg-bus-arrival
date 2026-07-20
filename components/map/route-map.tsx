"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { StopClusterLayer } from "@/components/map/stop-cluster-layer";
import { AnimatedBusMarker } from "@/components/map/animated-bus-marker";
import { LocateControl } from "@/components/map/locate-control";
import {
  createDestinationIcon,
  createOriginIcon,
  createStopIcon,
} from "@/lib/map-icons";
import { haversineDistanceMeters, formatDistance } from "@/lib/utils";
import type { BusStop, RouteStop } from "@/types/bus";
import { useSettings } from "@/hooks/use-settings";
import { useTranslation } from "@/hooks/use-translation";

interface RouteMapProps {
  routeStops: RouteStop[];
  liveBus?: { latitude: number; longitude: number } | null;
  currentStopCode?: string | null;
}

const TILE_LAYERS = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
};

export function RouteMap({ routeStops, liveBus, currentStopCode }: RouteMapProps) {
  const { settings } = useSettings();
  const { t } = useTranslation();
  const tileLayer = TILE_LAYERS[settings.mapTheme];

  const stopsWithLocation = useMemo(
    () => routeStops.filter((r): r is RouteStop & { stop: BusStop } => Boolean(r.stop)),
    [routeStops]
  );

  const polylinePositions = useMemo(
    () => stopsWithLocation.map((r) => [r.stop.latitude, r.stop.longitude] as [number, number]),
    [stopsWithLocation]
  );

  const center = polylinePositions[Math.floor(polylinePositions.length / 2)] ?? [
    1.3521, 103.8198,
  ];

  const currentIndex = stopsWithLocation.findIndex(
    (r) => r.busStopCode === currentStopCode
  );
  const remainingStops =
    currentIndex >= 0 ? stopsWithLocation.length - 1 - currentIndex : null;

  const remainingDistanceMeters = useMemo(() => {
    if (currentIndex < 0) return null;
    let total = 0;
    for (let i = currentIndex; i < stopsWithLocation.length - 1; i++) {
      const a = stopsWithLocation[i].stop;
      const b = stopsWithLocation[i + 1].stop;
      total += haversineDistanceMeters(a.latitude, a.longitude, b.latitude, b.longitude);
    }
    return total;
  }, [currentIndex, stopsWithLocation]);

  const originStop = stopsWithLocation[0];
  const destinationStop = stopsWithLocation[stopsWithLocation.length - 1];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-4xl">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full"
        aria-label={t("map.interactiveRouteAria")}
      >
        <TileLayer url={tileLayer.url} attribution={tileLayer.attribution} />

        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{ color: "#cf3f74", weight: 4, opacity: 0.85 }}
          />
        )}

        <StopClusterLayer
          stops={stopsWithLocation
            .filter(
              (r) =>
                r.busStopCode !== originStop?.busStopCode &&
                r.busStopCode !== destinationStop?.busStopCode
            )
            .map((r) => r.stop)}
        />

        {currentStopCode &&
          stopsWithLocation
            .filter((r) => r.busStopCode === currentStopCode)
            .map((r) => (
              <Marker
                key={r.busStopCode}
                position={[r.stop.latitude, r.stop.longitude]}
                icon={createStopIcon({ highlighted: true })}
                alt={t("map.currentStopAlt", { name: r.stop.description })}
              />
            ))}

        {originStop && (
          <Marker
            position={[originStop.stop.latitude, originStop.stop.longitude]}
            icon={createOriginIcon()}
            alt={t("map.originAlt", { name: originStop.stop.description })}
          />
        )}

        {destinationStop && (
          <Marker
            position={[destinationStop.stop.latitude, destinationStop.stop.longitude]}
            icon={createDestinationIcon()}
            alt={t("map.destinationAlt", { name: destinationStop.stop.description })}
          />
        )}

        {liveBus && (
          <AnimatedBusMarker
            latitude={liveBus.latitude}
            longitude={liveBus.longitude}
            label={t("map.liveBusLocation")}
          />
        )}

        <LocateControl />
        <FitBoundsOnLoad positions={polylinePositions} />
      </MapContainer>

      {(remainingStops !== null || remainingDistanceMeters !== null) && (
        <div className="glass-panel absolute left-4 top-4 z-[1000] rounded-3xl px-4 py-3 text-sm">
          <p className="font-semibold text-slate-800">
            {remainingStops !== null
              ? t("map.stopsRemaining", { count: remainingStops })
              : t("map.routeInfo")}
          </p>
          {remainingDistanceMeters !== null && (
            <p className="text-xs text-slate-500">
              {t("map.toDestination", { distance: formatDistance(remainingDistanceMeters) })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function FitBoundsOnLoad({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useMemo(() => {
    if (positions.length > 1) {
      map.fitBounds(positions, { padding: [40, 40] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions.length]);
  return null;
}
