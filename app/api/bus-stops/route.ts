import { NextResponse } from "next/server";
import { getAllBusStops } from "@/services/bus-stops-service";
import { LtaApiError } from "@/services/lta-client";
import { cached } from "@/lib/server-cache";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    const stops = await cached("all-bus-stops", ONE_DAY_MS, getAllBusStops);
    return NextResponse.json(
      { stops },
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
