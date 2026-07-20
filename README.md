# SG Bus Arrival

A real-time Singapore bus arrival tracker built with Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, and Leaflet — powered by LTA DataMall.

## ⚠️ Before you run this

This project needs an LTA DataMall API key. **Never commit your real key or paste it into chat/docs/public repos.**

1. Register for a free key at https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html
2. Copy `.env.local.example` to `.env.local`
3. Set `LTA_ACCOUNT_KEY=your_real_key_here` in `.env.local`

> If you previously pasted a real key anywhere public (chat, a shared doc, a public repo), treat it as compromised and rotate it in the DataMall dashboard.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production build

```bash
npm run build
npm run start
```

## Project structure

```
app/                    Next.js App Router pages + API routes
  api/                  Route handlers wrapping LTA DataMall (server-only key usage)
  bus/[serviceNo]/       Bus details page
  route/[serviceNo]/     Full-screen interactive route map
  favorites/, notifications/, settings/
components/
  bus/                   Bus stop cards, service rows, countdown, badges
  map/                   Leaflet route map, clustering, animated bus marker
  search/                Autocomplete search bar
  layout/                Navbar, hero
  favorites/, notifications/, settings/
  providers/             React Query + theme providers
  ui/                    Skeletons, error boundary
hooks/                   React Query hooks + localStorage-backed state hooks
services/                Server-only LTA DataMall client + per-endpoint services
lib/                     Utils, mappers, in-memory cache, POI seed data
types/                   Raw LTA API types + app domain types
```

## Features

- Live bus arrivals (current/next/following ETA), auto-refreshing on a configurable interval (default 15s)
- Occupancy, wheelchair-accessible, double-deck, and air-conditioned indicators
- Geolocation-based nearby stops, with a Singapore-wide search covering bus numbers, stop names, road names, MRT stations, and malls, with autocomplete
- Bus details page: operator, first/last bus, peak frequency, live operating status
- Full-screen interactive map: animated bus marker (smoothly interpolates and rotates toward live coordinates), route polyline, clustered stop markers, origin/destination pins, current-stop highlight, remaining stops/distance, locate-me control, light/dark/satellite tile themes
- Favorites (stops + services), recent searches, and "arriving soon" notifications for favorited services — all persisted locally
- Settings: dark mode (light/dark/system), language, refresh interval, map style
- Glassmorphism UI, dark mode, Framer Motion animations, skeleton loading states, error boundaries, full ARIA labeling

## Notes on data sources

- All live bus data comes from LTA DataMall. The account key is used **server-side only** (`services/lta-client.ts`, imported via `server-only`) — it is never sent to the browser.
- Bus stops, routes, and service info are large paginated datasets; they're cached in-memory for 24h server-side (`lib/server-cache.ts`) to avoid re-fetching thousands of records on every request. For a multi-instance deployment, swap this for Redis/KV.
- MRT station and shopping mall data (`lib/poi-data.ts`) is a small curated seed list, since LTA DataMall doesn't expose these directly — extend as needed.
- Service disruption notices on the Notifications page are illustrative samples (`lib/sample-notices.ts`), since LTA's free tier doesn't expose a public disruptions feed. Swap in a real source (e.g. LTA's Traffic Incidents API) if you have access.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Framer Motion · Leaflet + react-leaflet + leaflet.markercluster · OpenStreetMap tiles (via CARTO) · TanStack React Query · Lucide React

## Verified

- `npm run build` — clean, all 13 routes compile and prerender successfully
- `npx tsc --noEmit` — zero type errors
- `npx eslint .` — zero errors, zero warnings
- Manual smoke test of all pages against a running production server (200 responses, correct SSR content, graceful API error handling when the LTA key is invalid)
