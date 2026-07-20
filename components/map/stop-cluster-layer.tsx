"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import { createStopIcon } from "@/lib/map-icons";
import { useTranslation } from "@/hooks/use-translation";
import type { BusStop } from "@/types/bus";

interface StopClusterLayerProps {
  stops: BusStop[];
  onStopClick?: (stop: BusStop) => void;
}

/**
 * Renders bus stops as a clustered marker layer. Uses leaflet.markercluster
 * imperatively since react-leaflet has no first-class cluster component.
 */
export function StopClusterLayer({ stops, onStopClick }: StopClusterLayerProps) {
  const map = useMap();
  const { t } = useTranslation();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div style="
            display:flex;align-items:center;justify-content:center;
            width:38px;height:38px;border-radius:9999px;
            background:linear-gradient(135deg,#ed85ac,#cf3f74);
            color:white;font-weight:700;font-size:13px;
            border:3px solid white;
            box-shadow:0 4px 14px rgba(207,63,116,0.4);
          ">${count}</div>`,
          className: "sgbus-cluster-icon",
          iconSize: [38, 38],
        });
      },
    });

    clusterGroupRef.current = clusterGroup;
    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
      clusterGroupRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const clusterGroup = clusterGroupRef.current;
    if (!clusterGroup) return;

    clusterGroup.clearLayers();

    const markers = stops.map((stop) => {
      const marker = L.marker([stop.latitude, stop.longitude], {
        icon: createStopIcon(),
        keyboard: true,
        alt: t("map.busStopAlt", { name: stop.description }),
      });
      marker.bindPopup(
        `<div style="min-width:160px">
          <p style="font-weight:600;margin:0 0 2px 0;">${escapeHtml(stop.description)}</p>
          <p style="font-size:12px;color:#64748b;margin:0;">${escapeHtml(stop.roadName)} · ${escapeHtml(stop.busStopCode)}</p>
        </div>`
      );
      if (onStopClick) {
        marker.on("click", () => onStopClick(stop));
      }
      return marker;
    });

    clusterGroup.addLayers(markers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops, t]);

  return null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
