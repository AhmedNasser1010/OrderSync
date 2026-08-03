function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

function getDistanceFromLatlngInKm(latlng1: number[], latlng2: number[]) {
  const R = 6371;
  const dLat = deg2rad(latlng2[0] - latlng1[0]);
  const dLon = deg2rad(latlng2[1] - latlng1[1]);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(latlng1[0])) *
      Math.cos(deg2rad(latlng2[0])) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default getDistanceFromLatlngInKm;
