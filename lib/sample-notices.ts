import type { AppNotification } from "@/types/bus";

/**
 * LTA DataMall's free tier does not expose a public service-disruption feed,
 * so these are illustrative sample notices to demonstrate the notifications
 * UI end-to-end. Swap this for a real disruptions/traffic-incidents source
 * (e.g. LTA's Traffic Incidents API) when available.
 */
export function getSampleSystemNotices(): AppNotification[] {
  const now = Date.now();
  return [
    {
      id: "sample-disruption-1",
      kind: "disruption",
      title: "Service 174 diversion",
      message:
        "Service 174 is temporarily diverted near Clementi Road due to roadworks. Expect delays of 5–10 minutes.",
      createdAt: new Date(now - 25 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: "sample-closure-1",
      kind: "closure",
      title: "Road closure on Orchard Road",
      message:
        "Partial road closure on Orchard Road this weekend for a community event. Some bus stops may be temporarily relocated.",
      createdAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: "sample-delay-1",
      kind: "delay",
      title: "Higher than usual wait times",
      message:
        "Several services in the CBD area are reporting longer wait times during the evening peak due to heavy traffic.",
      createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
  ];
}
