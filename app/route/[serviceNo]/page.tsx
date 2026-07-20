import { RouteView } from "@/components/map/route-view";

export default async function RoutePage({
  params,
}: {
  params: Promise<{ serviceNo: string }>;
}) {
  const { serviceNo } = await params;
  return <RouteView serviceNo={serviceNo} />;
}
