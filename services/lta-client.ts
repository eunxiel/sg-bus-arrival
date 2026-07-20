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

interface PaginatedResponse<T> {
  value?: T[];
}

interface FetchAllPagesOptions {
  pageSize?: number;
  maxPages?: number;
  concurrency?: number;
}

async function fetchPageWithRetry<T>(
  path: string,
  skip: number,
  retries = 2
): Promise<PaginatedResponse<T>> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await ltaFetch<PaginatedResponse<T>>(path, { params: { $skip: skip } });
    } catch (err) {
      // LTA occasionally 500s a page under concurrent load even well within
      // the real dataset range — treating that as "end of data" would
      // silently truncate results, so retry a couple times before giving up.
      if (attempt >= retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
    }
  }
}

/**
 * LTA's list endpoints (BusStops, BusRoutes, BusServices) paginate at 500
 * rows per page via $skip, with no way to know the total count up front.
 * Fetching pages one-at-a-time (await each, then request the next) means a
 * ~26k-row dataset like BusRoutes takes ~50 sequential round trips — tens of
 * seconds on a cold cache. Instead, fetch pages in concurrent batches and
 * stop once a page in a batch comes back short (the last page); any
 * speculative pages requested past the end just return empty and are
 * harmless.
 */
export async function fetchAllPages<T>(
  path: string,
  options: FetchAllPagesOptions = {}
): Promise<T[]> {
  const pageSize = options.pageSize ?? 500;
  const maxPages = options.maxPages ?? 80;
  const concurrency = options.concurrency ?? 10;

  const all: T[] = [];
  let page = 0;
  let done = false;

  while (!done && page < maxPages) {
    const batchPages = Array.from(
      { length: Math.min(concurrency, maxPages - page) },
      (_, i) => page + i
    );

    const results = await Promise.all(
      batchPages.map((p) => fetchPageWithRetry<T>(path, p * pageSize))
    );

    for (const data of results) {
      const values = data.value ?? [];
      all.push(...values);
      if (values.length < pageSize) done = true;
    }

    page += batchPages.length;
  }

  return all;
}

export { LtaApiError };
