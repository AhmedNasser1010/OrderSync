import L from "leaflet";

function createSvgIcon(svg: string, bgColor: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="width:36px;height:36px;background:${bgColor};border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid white;">${svg}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function createRadarIcon(svg: string, bgColor: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div class="map-radar-marker" style="color:${bgColor};width:36px;height:36px;"><div style="width:36px;height:36px;background:${bgColor};border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid white;position:relative;z-index:1;">${svg}</div></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

const DRIVER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3.5-3.5 2-3 2 3h3"/></svg>`;

export const driverIcon = createSvgIcon(DRIVER_SVG, "#3b82f6");

export function createDriverHeadingIcon(heading: number): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:36px;height:36px;">
      <div style="position:absolute;left:50%;top:50%;width:0;height:0;transform:rotate(${heading}deg);">
        <div style="position:absolute;left:-7px;top:-27px;width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-bottom:12px solid #3b82f6;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.4));"></div>
      </div>
      <div style="position:relative;width:36px;height:36px;background:#3b82f6;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid white;">${DRIVER_SVG}</div>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

export const orderIcon = createSvgIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  "#ef4444"
);

export const restaurantIcon = createSvgIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/></svg>`,
  "#6b7280"
);

const ORDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;

const STATUS_COLORS: Record<string, string> = {
  READY: "#10b981",
  RESERVED: "#3b82f6",
  PICKED_UP: "#f59e0b",
  ON_ROUTE: "#a855f7",
  DELIVERED: "#22c55e",
  CANCELED: "#ef4444",
  REJECTED: "#ef4444",
};

const DEFAULT_COLOR = "#6b7280";

const STALE_WARNING_MS = 3 * 60 * 1000;
const STALE_CRITICAL_MS = 7 * 60 * 1000;

export function createOrderStatusIcon(status: string, readyAt?: number): L.DivIcon {
  const color = STATUS_COLORS[status] ?? DEFAULT_COLOR;

  if (status === "READY") {
    const elapsed = readyAt ? Date.now() - readyAt : 0;
    if (elapsed >= STALE_CRITICAL_MS) {
      return createRadarIcon(ORDER_SVG, "#ef4444");
    }
    if (elapsed >= STALE_WARNING_MS) {
      return createRadarIcon(ORDER_SVG, "#f59e0b");
    }
    return createRadarIcon(ORDER_SVG, color);
  }

  return createSvgIcon(ORDER_SVG, color);
}

export const marketplaceOrderIcon = createRadarIcon(ORDER_SVG, "#10b981");

export const activeOrderIcon = createSvgIcon(ORDER_SVG, "#f59e0b");
