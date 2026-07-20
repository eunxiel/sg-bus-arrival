import { NextRequest, NextResponse } from "next/server";
import { getBusArrivals } from "@/services/bus-arrival-service";
import { LtaApiError } from "@/services/lta-client";

export async function GET(request: NextRequest) {
  const busStopCode = request.nextUrl.searchParams.get("busStopCode");
  const serviceNo = request.nextUrl.searchParams.get("serviceNo") ?? undefined;

  if (!busStopCode) {
    return NextResponse.json(
      { error: "Missing required query param: busStopCode" },
      { status: 400 }
    );
  }

  try {
    const result = await getBusArrivals(busStopCode, serviceNo);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const status = err instanceof LtaApiError ? err.status : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status }
    );
  }
}
