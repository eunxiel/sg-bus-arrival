import { NextRequest, NextResponse } from "next/server";
import { getAllBusStops } from "@/services/bus-stops-service";
import { LtaApiError } from "@/services/lta-client";
import { cached } from "@/lib/server-cache";
import { haversineDistanceMeters } from "@/lib/utils";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RADIUS_METERS = 500;
const MAX_RESULTS = 20;

export async function GET(request: NextRequest) {
  const lat = Number.parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const lng = Number.parseFloat(request.nextUrl.searchParams.get("lng") ?? "");
  const radius = Number.parseFloat(
    request.nextUrl.searchParams.get("radius") ?? String(DEFAULT_RADIUS_METERS)
  );

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "Missing or invalid lat/lng query params" },
      { status: 400 }
    );
  }

  try {
    const allStops = await cached("all-bus-stops", ONE_DAY_MS, getAllBusStops);

    const withDistance = allStops
      .map((stop) => ({
        ...stop,
        distanceMeters: haversineDistanceMeters(
          lat,
          lng,
          stop.latitude,
          stop.longitude
        ),
      }))
      .filter((stop) => stop.distanceMeters <= radius)
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, MAX_RESULTS);

    return NextResponse.json(
      { stops: withDistance },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    const status = err instanceof LtaApiError ? err.status : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status }
    );
  }
}
