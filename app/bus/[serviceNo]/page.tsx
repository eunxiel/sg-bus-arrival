import { Navbar } from "@/components/layout/navbar";
import { BusDetailsView } from "@/components/bus/bus-details-view";

export default async function BusDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ serviceNo: string }>;
  searchParams: Promise<{ busStopCode?: string }>;
}) {
  const { serviceNo } = await params;
  const { busStopCode } = await searchParams;

  return (
    <main className="min-h-screen pb-10">
      <Navbar />
      <BusDetailsView serviceNo={serviceNo} busStopCode={busStopCode ?? null} />
    </main>
  );
}
