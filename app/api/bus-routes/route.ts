import { NextRequest, NextResponse } from "next/server";
import { getAllBusRoutes } from "@/services/bus-routes-service";
import { getAllBusStops } from "@/services/bus-stops-service";
import { LtaApiError } from "@/services/lta-client";
import { cached } from "@/lib/server-cache";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const serviceNo = request.nextUrl.searchParams.get("serviceNo");
  const directionParam = request.nextUrl.searchParams.get("direction");
  const direction = directionParam ? Number.parseInt(directionParam, 10) : undefined;

  if (!serviceNo) {
    return NextResponse.json(
      { error: "Missing required query param: serviceNo" },
      { status: 400 }
    );
  }

  try {
    const [allRoutes, allStops] = await Promise.all([
      cached("all-bus-routes", ONE_DAY_MS, getAllBusRoutes),
      cached("all-bus-stops", ONE_DAY_MS, getAllBusStops),
    ]);

    const stopsByCode = new Map(allStops.map((s) => [s.busStopCode, s]));

    const route = allRoutes
      .filter(
        (r) =>
          r.serviceNo === serviceNo &&
          (direction === undefined || r.direction === direction)
      )
      .sort((a, b) => a.stopSequence - b.stopSequence)
      .map((r) => ({ ...r, stop: stopsByCode.get(r.busStopCode) }));

    return NextResponse.json(
      { route },
      { headers: { "Cache-Control": "public, max-age=3600" } }
    );
  } catch (err) {
    const status = err instanceof LtaApiError ? err.status : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status }
    );
  }
}
