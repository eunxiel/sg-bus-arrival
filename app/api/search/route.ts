import { NextRequest, NextResponse } from "next/server";
import { getAllBusStops } from "@/services/bus-stops-service";
import { getAllBusServices } from "@/services/bus-services-service";
import { LtaApiError } from "@/services/lta-client";
import { cached } from "@/lib/server-cache";
import { MRT_STATIONS, SHOPPING_MALLS } from "@/lib/poi-data";
import type { SearchResult } from "@/types/bus";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RESULTS = 15;

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();

  if (q.length === 0) {
    return NextResponse.json({ results: [] });
  }

  try {
    const [stops, services] = await Promise.all([
      cached("all-bus-stops", ONE_DAY_MS, getAllBusStops),
      cached("all-bus-services", ONE_DAY_MS, getAllBusServices),
    ]);

    const results: SearchResult[] = [];

    // Bus service numbers (exact prefix match ranks first)
    const seenServices = new Set<string>();
    for (const svc of services) {
      if (seenServices.has(svc.serviceNo)) continue;
      if (svc.serviceNo.toLowerCase().startsWith(q)) {
        seenServices.add(svc.serviceNo);
        results.push({
          id: `service-${svc.serviceNo}`,
          kind: "bus_service",
          title: `Bus ${svc.serviceNo}`,
          subtitle: `${svc.category} · ${svc.originCode} → ${svc.destinationCode}`,
          serviceNo: svc.serviceNo,
        });
      }
    }

    // Bus stops (name, code, or road name match)
    for (const stop of stops) {
      if (results.length >= MAX_RESULTS * 3) break;
      const matches =
        stop.description.toLowerCase().includes(q) ||
        stop.busStopCode.includes(q) ||
        stop.roadName.toLowerCase().includes(q);
      if (matches) {
        results.push({
          id: `stop-${stop.busStopCode}`,
          kind: "bus_stop",
          title: stop.description,
          subtitle: `${stop.roadName} · ${stop.busStopCode}`,
          busStopCode: stop.busStopCode,
          latitude: stop.latitude,
          longitude: stop.longitude,
        });
      }
    }

    // MRT stations
    for (const mrt of MRT_STATIONS) {
      if (mrt.name.toLowerCase().includes(q)) {
        results.push({
          id: `mrt-${mrt.name}`,
          kind: "mrt_station",
          title: mrt.name,
          subtitle: "MRT Station",
          latitude: mrt.latitude,
          longitude: mrt.longitude,
        });
      }
    }

    // Shopping malls
    for (const mall of SHOPPING_MALLS) {
      if (mall.name.toLowerCase().includes(q)) {
        results.push({
          id: `mall-${mall.name}`,
          kind: "mall",
          title: mall.name,
          subtitle: "Shopping Mall",
          latitude: mall.latitude,
          longitude: mall.longitude,
        });
      }
    }

    // Rank: exact/prefix matches first, then alphabetical, cap total.
    const ranked = results
      .sort((a, b) => {
        const aStarts = a.title.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.title.toLowerCase().startsWith(q) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.title.localeCompare(b.title);
      })
      .slice(0, MAX_RESULTS);

    return NextResponse.json(
      { results: ranked },
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
