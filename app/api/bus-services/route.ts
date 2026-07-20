import { NextRequest, NextResponse } from "next/server";
import { getAllBusServices } from "@/services/bus-services-service";
import { LtaApiError } from "@/services/lta-client";
import { cached } from "@/lib/server-cache";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const serviceNo = request.nextUrl.searchParams.get("serviceNo");

  try {
    const all = await cached("all-bus-services", ONE_DAY_MS, getAllBusServices);
    const services = serviceNo
      ? all.filter((s) => s.serviceNo === serviceNo)
      : all;

    return NextResponse.json(
      { services },
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
