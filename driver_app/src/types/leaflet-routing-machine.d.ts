declare module "@fleetbase/leaflet-routing-machine" {
  import * as L from "leaflet";

  interface OSRMv1Options {
    serviceUrl?: string;
    profile?: string;
    suppressDemoServerWarning?: boolean;
  }

  interface RoutingControlOptions {
    waypoints: L.LatLng[];
    router?: OSRMv1;
    fitSelectedRoutes?: boolean | string;
    show?: boolean;
    addWaypoints?: boolean;
    draggableWaypoints?: boolean;
    waypointMode?: string;
    routeWhileDragging?: boolean;
    routeDragInterval?: number;
    showAlternatives?: boolean;
    lineOptions?: {
      styles?: Array<{ color?: string; weight?: number; opacity?: number }>;
    };
    markerOptions?: {
      icon?: L.Icon | L.DivIcon;
    };
    createMarker?: (
      i: number,
      waypoint: { latLng: L.LatLng; name?: string; isViaPoint?: boolean },
      nWps: number
    ) => L.Marker | null;
    defaultErrorHandler?: (e: { error: unknown }) => void;
  }

  interface OSRMv1Route {
    coordinates: L.LatLng[];
    instructions: Array<{
      type: string;
      distance: number;
      time: number;
      road: string;
      direction: string;
      text: string;
    }>;
    summary: { totalDistance: number; totalTime: number };
    name: string;
  }

  class OSRMv1 {
    constructor(options?: OSRMv1Options);
    route(
      waypoints: Array<{ latLng: L.LatLng; name?: string }>,
      callback: (err: unknown, routes?: OSRMv1Route[]) => void,
      context?: unknown,
      options?: { geometryOnly?: boolean; simplifyGeometry?: boolean },
    ): void;
  }

  class Control extends L.Control {
    constructor(options?: RoutingControlOptions);
    getPlan(): Plan;
    hide(): void;
    show(): void;
    setWaypoints(waypoints: L.LatLng[]): this;
    spliceWaypoints(
      index: number,
      count: number,
      ...waypoints: L.LatLng[]
    ): L.LatLng[];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Plan {} // plan interface stub
}
