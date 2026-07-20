import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/layout/hero";
import { TripPlannerView } from "@/components/trip/trip-planner-view";
import { NearbyStopsSection } from "@/components/bus/nearby-stops-section";
import { BusStopListSkeleton } from "@/components/ui/skeletons";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function HomePage() {
  return (
    <main className="min-h-screen pb-10">
      <Navbar />
      <Hero />
      <ErrorBoundary>
        <TripPlannerView headingLevel="h2" />
      </ErrorBoundary>
      <ErrorBoundary>
        <Suspense fallback={<BusStopListSkeleton />}>
          <NearbyStopsSection />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
