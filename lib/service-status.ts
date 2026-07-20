export type ServiceStatus =
  | "in_operation"
  | "ending_soon"
  | "not_in_operation"
  | "schedule_unavailable";

export interface ServiceStatusResult {
  status: ServiceStatus;
}

/**
 * Determines a friendly operating status for "right now" in Singapore time,
 * given first/last bus HHmm strings for the current day type.
 */
export function getServiceStatus(
  firstBusHHmm: string,
  lastBusHHmm: string
): ServiceStatusResult {
  if (!firstBusHHmm || !lastBusHHmm || firstBusHHmm.length < 4 || lastBusHHmm.length < 4) {
    return { status: "schedule_unavailable" };
  }

  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore" })
  );
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const firstMinutes =
    Number.parseInt(firstBusHHmm.slice(0, 2), 10) * 60 +
    Number.parseInt(firstBusHHmm.slice(2, 4), 10);
  let lastMinutes =
    Number.parseInt(lastBusHHmm.slice(0, 2), 10) * 60 +
    Number.parseInt(lastBusHHmm.slice(2, 4), 10);

  // Services that run past midnight (e.g. last bus 0130) wrap to the next day.
  const wrapsPastMidnight = lastMinutes < firstMinutes;
  if (wrapsPastMidnight) lastMinutes += 24 * 60;

  const effectiveNow = wrapsPastMidnight && nowMinutes < firstMinutes ? nowMinutes + 24 * 60 : nowMinutes;

  if (effectiveNow < firstMinutes || effectiveNow > lastMinutes) {
    return { status: "not_in_operation" };
  }

  if (lastMinutes - effectiveNow <= 30) {
    return { status: "ending_soon" };
  }

  return { status: "in_operation" };
}

function currentDayType(): "weekday" | "saturday" | "sunday" {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore" })
  );
  const day = now.getDay();
  if (day === 0) return "sunday";
  if (day === 6) return "saturday";
  return "weekday";
}

export { currentDayType };
