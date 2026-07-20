import { NextRequest, NextResponse } from "next/server";
import { getAllBusStops } from "@/services/bus-stops-service";
import { getAllBusRoutes } from "@/services/bus-routes-service";
import { getBusArrivals } from "@/services/bus-arrival-service";
import { LtaApiError } from "@/services/lta-client";
import { cached } from "@/lib/server-cache";
import { haversineDistanceMeters } from "@/lib/utils";
import type { RouteStop, TripSuggestion } from "@/types/bus";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const CANDIDATE_RADIUS_METERS = 700;
const MAX_CANDIDATE_STOPS = 12;
// Rough average scheduled speed for an urban SG bus service (mixed traffic +
// dwell time at stops) — used only to rank suggestions, not shown as exact.
const AVERAGE_BUS_SPEED_KMH = 20;
const MAX_SUGGESTIONS = 8;

interface Candidate {
  serviceNo: string;
  direction: number;
  originStopCode: string;
  destStopCode: string;
  walkMeters: number;
  distanceKm: number;
  numStops: number;
}

export async function GET(request: NextRequest) {
  const fromLat = Number.parseFloat(request.nextUrl.searchParams.get("fromLat") ?? "");
  const fromLng = Number.parseFloat(request.nextUrl.searchParams.get("fromLng") ?? "");
  const toLat = Number.parseFloat(request.nextUrl.searchParams.get("toLat") ?? "");
  const toLng = Number.parseFloat(request.nextUrl.searchParams.get("toLng") ?? "");

  if (![fromLat, fromLng, toLat, toLng].every(Number.isFinite)) {
    return NextResponse.json(
      { error: "Missing or invalid fromLat/fromLng/toLat/toLng query params" },
      { status: 400 }
    );
  }

  try {
    const [allStops, allRoutes] = await Promise.all([
      cached("all-bus-stops", ONE_DAY_MS, getAllBusStops),
      cached("all-bus-routes", ONE_DAY_MS, getAllBusRoutes),
    ]);

    const stopsByCode = new Map(allStops.map((s) => [s.busStopCode, s]));

    function nearestStops(lat: number, lng: number) {
      return allStops
        .map((s) => ({
          busStopCode: s.busStopCode,
          distanceMeters: haversineDistanceMeters(lat, lng, s.latitude, s.longitude),
        }))
        .filter((s) => s.distanceMeters <= CANDIDATE_RADIUS_METERS)
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, MAX_CANDIDATE_STOPS);
    }

    const originCandidates = nearestStops(fromLat, fromLng);
    const destinationCandidates = nearestStops(toLat, toLng);

    if (originCandidates.length === 0 || destinationCandidates.length === 0) {
      return NextResponse.json(
        { suggestions: [] },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const originDistanceByStop = new Map(
      originCandidates.map((c) => [c.busStopCode, c.distanceMeters])
    );
    const originCodes = new Set(originCandidates.map((c) => c.busStopCode));
    const destinationCodes = new Set(destinationCandidates.map((c) => c.busStopCode));

    // Group route rows by (serviceNo, direction), restricted to rows that
    // touch one of our candidate stops, so we only scan relevant services.
    const routesByServiceDir = new Map<string, RouteStop[]>();
    for (const r of allRoutes) {
      if (!originCodes.has(r.busStopCode) && !destinationCodes.has(r.busStopCode)) continue;
      const key = `${r.serviceNo}|${r.direction}`;
      const arr = routesByServiceDir.get(key);
      if (arr) arr.push(r);
      else routesByServiceDir.set(key, [r]);
    }

    const candidates: Candidate[] = [];

    for (const rows of routesByServiceDir.values()) {
      const originRows = rows.filter((r) => originCodes.has(r.busStopCode));
      const destRows = rows.filter((r) => destinationCodes.has(r.busStopCode));
      if (originRows.length === 0 || destRows.length === 0) continue;

      for (const originRow of originRows) {
        for (const destRow of destRows) {
          if (destRow.stopSequence <= originRow.stopSequence) continue; // wrong direction

          candidates.push({
            serviceNo: originRow.serviceNo,
            direction: originRow.direction,
            originStopCode: originRow.busStopCode,
            destStopCode: destRow.busStopCode,
            walkMeters: originDistanceByStop.get(originRow.busStopCode) ?? 0,
            distanceKm: Math.max(0.1, destRow.distanceKm - originRow.distanceKm),
            numStops: destRow.stopSequence - originRow.stopSequence,
          });
        }
      }
    }

    if (candidates.length === 0) {
      return NextResponse.json(
        { suggestions: [] },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // Fetch live arrivals once per distinct origin stop actually used.
    const uniqueOriginStops = Array.from(new Set(candidates.map((c) => c.originStopCode)));
    const arrivalEntries = await Promise.all(
      uniqueOriginStops.map(async (code) => [code, await getBusArrivals(code)] as const)
    );
    const arrivalsByStop = new Map(arrivalEntries);

    const suggestions: TripSuggestion[] = [];

    for (const c of candidates) {
      const arrivalData = arrivalsByStop.get(c.originStopCode);
      const service = arrivalData?.services.find((s) => s.serviceNo === c.serviceNo);
      if (!service || service.next.etaSeconds === null) continue;

      const travelSeconds = Math.round((c.distanceKm / AVERAGE_BUS_SPEED_KMH) * 3600);
      const totalSeconds = service.next.etaSeconds + travelSeconds;

      suggestions.push({
        serviceNo: c.serviceNo,
        direction: c.direction,
        operator: service.operatorFullName,
        boardStop: {
          busStopCode: c.originStopCode,
          description: stopsByCode.get(c.originStopCode)?.description ?? c.originStopCode,
          walkMeters: Math.round(c.walkMeters),
        },
        alightStop: {
          busStopCode: c.destStopCode,
          description: stopsByCode.get(c.destStopCode)?.description ?? c.destStopCode,
        },
        boardEtaSeconds: service.next.etaSeconds,
        boardEtaISO: service.next.etaISO,
        travelSeconds,
        totalSeconds,
        numStops: c.numStops,
        distanceKm: Math.round(c.distanceKm * 10) / 10,
        load: service.next.load,
        wheelchairAccessible: service.next.wheelchairAccessible,
      });
    }

    // Keep only the fastest boarding option per service, then rank fastest-first.
    const bestPerService = new Map<string, TripSuggestion>();
    for (const s of suggestions) {
      const existing = bestPerService.get(s.serviceNo);
      if (!existing || s.totalSeconds < existing.totalSeconds) {
        bestPerService.set(s.serviceNo, s);
      }
    }

    const ranked = Array.from(bestPerService.values())
      .sort((a, b) => a.totalSeconds - b.totalSeconds)
      .slice(0, MAX_SUGGESTIONS);

    return NextResponse.json(
      { suggestions: ranked },
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
