import L from "leaflet";

/**
 * All icons are built as DivIcons with inline SVG/HTML so we avoid Leaflet's
 * default-image bundler path issues entirely, and can style them to match
 * the app's glass/blue design language.
 */

export function createStopIcon(options?: { highlighted?: boolean }) {
  const highlighted = options?.highlighted ?? false;
  const size = highlighted ? 16 : 10;
  const color = highlighted ? "#cf3f74" : "#94a3b8";

  return L.divIcon({
    className: "sgbus-stop-icon",
    html: `<span style="
      display:block;
      width:${size}px;
      height:${size}px;
      border-radius:9999px;
      background:${color};
      border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.25);
    "></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function createDestinationIcon() {
  return L.divIcon({
    className: "sgbus-destination-icon",
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:28px;height:28px;border-radius:9999px;
      background:#ef4444;color:white;
      border:3px solid white;
      box-shadow:0 4px 12px rgba(239,68,68,0.4);
      font-size:14px;font-weight:700;
    ">🏁</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function createOriginIcon() {
  return L.divIcon({
    className: "sgbus-origin-icon",
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:26px;height:26px;border-radius:9999px;
      background:#10b981;color:white;
      border:3px solid white;
      box-shadow:0 4px 12px rgba(16,185,129,0.4);
      font-size:12px;font-weight:700;
    ">A</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

export function createUserLocationIcon() {
  return L.divIcon({
    className: "sgbus-user-icon",
    html: `<div style="position:relative;width:20px;height:20px;">
      <span style="
        position:absolute;inset:0;border-radius:9999px;
        background:rgba(227,93,144,0.35);
        animation:pulseRing 1.8s cubic-bezier(0.4,0,0.6,1) infinite;
      "></span>
      <span style="
        position:absolute;top:4px;left:4px;width:12px;height:12px;
        border-radius:9999px;background:#cf3f74;border:2px solid white;
        box-shadow:0 1px 4px rgba(0,0,0,0.3);
      "></span>
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export function createBusIcon(bearingDeg = 0) {
  return L.divIcon({
    className: "sgbus-bus-icon",
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:34px;height:34px;border-radius:9999px;
      background:linear-gradient(135deg,#ed85ac,#cf3f74);
      border:3px solid white;
      box-shadow:0 6px 16px rgba(207,63,116,0.5);
      transform:rotate(${bearingDeg}deg);
      transition:transform 0.6s ease-out;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(${-bearingDeg}deg)">
        <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/>
        <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/>
        <circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>
      </svg>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}
