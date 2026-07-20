"use client";

import dynamic from "next/dynamic";
import { MapSkeleton } from "@/components/ui/skeletons";

export const RouteMapDynamic = dynamic(
  () => import("@/components/map/route-map").then((mod) => mod.RouteMap),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);
