import { Timestamp, GeoPoint } from "firebase-admin/firestore";

export function deserialize(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(deserialize);
  }

  if (typeof value !== "object") {
    return value;
  }

  if ("__type" in value) {
    switch (value.__type) {
      case "timestamp":
        return new Timestamp(value.seconds, value.nanoseconds);

      case "geopoint":
        return new GeoPoint(value.latitude, value.longitude);

      default:
        throw new Error(`Unsupported Firestore type: ${value.__type}`);
    }
  }

  const obj: Record<string, any> = {};

  for (const [key, val] of Object.entries(value)) {
    obj[key] = deserialize(val);
  }

  return obj;
}