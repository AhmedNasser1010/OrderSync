function getDistanceFromLatlngInKm(latlng1, latlng2) {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(latlng2[0] - latlng1[0]) // deg2rad below
  const dLon = deg2rad(latlng2[1] - latlng1[1]) // Corrected this line
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(latlng1[0])) * Math.cos(deg2rad(latlng2[0])) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in km
  return distance
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

export default getDistanceFromLatlngInKm