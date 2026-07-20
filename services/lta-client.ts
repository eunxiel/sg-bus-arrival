import "server-only";

/**
 * Low-level HTTP client for the LTA DataMall API. This module must only ever
 * run on the server (Next.js API routes / route handlers) since it attaches
 * the secret AccountKey header. Never import this from client components.
 */

const LTA_BASE_URL = "https://datamall2.mytransport.sg/ltaodataservice";

class LtaApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "LtaApiError";
    this.status = status;
  }
}

function getAccountKey(): string {
  const key = process.env.LTA_ACCOUNT_KEY;
  if (!key || key.trim().length === 0 || key === "your_lta_datamall_account_key_here") {
    throw new LtaApiError(
      "LTA_ACCOUNT_KEY is not configured. Add your LTA DataMall API key to .env.local.",
      500
    );
  }
  return key;
}

interface LtaFetchOptions {
  params?: Record<string, string | number | undefined>;
  revalidateSeconds?: number;
}

export async function ltaFetch<T>(
  path: string,
  options: LtaFetchOptions = {}
): Promise<T> {
  const accountKey = getAccountKey();
  const url = new URL(`${LTA_BASE_URL}${path}`);

  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: {
        AccountKey: accountKey,
        accept: "application/json",
      },
      // Bus arrivals are highly time-sensitive; short/no cache by default.
      next: { revalidate: options.revalidateSeconds ?? 0 },
    });
  } catch (err) {
    throw new LtaApiError(
      `Failed to reach LTA DataMall: ${err instanceof Error ? err.message : "network error"}`,
      502
    );
  }

  if (!response.ok) {
    throw new LtaApiError(
      `LTA DataMall responded with ${response.status} ${response.statusText}`,
      response.status
    );
  }

  return (await response.json()) as T;
}

export { LtaApiError };
