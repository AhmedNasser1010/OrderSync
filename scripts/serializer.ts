import { Timestamp, GeoPoint } from "firebase-admin/firestore";

export function serialize(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Timestamp) {
    return {
      __type: "timestamp",
      seconds: value.seconds,
      nanoseconds: value.nanoseconds,
    };
  }

  if (value instanceof GeoPoint) {
    return {
      __type: "geopoint",
      latitude: value.latitude,
      longitude: value.longitude,
    };
  }

  if (Array.isArray(value)) {
    return value.map(serialize);
  }

  if (typeof value === "object") {
    const obj: Record<string, any> = {};

    for (const [key, val] of Object.entries(value)) {
      obj[key] = serialize(val);
    }

    return obj;
  }

  return value;
}
