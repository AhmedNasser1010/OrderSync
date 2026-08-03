import L from "leaflet";

const restaurantMapIcon = L.icon({
  iconUrl: "/assets/shop-svgrepo-com.svg",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const driverMapIcon = L.icon({
  iconUrl: "/assets/motor-scooter-svgrepo-com.svg",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const personMapIcon = L.icon({
  iconUrl: "/assets/person-boy-svgrepo-com.svg",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const markerMapIcon = L.icon({
  iconUrl: "/assets/marker.svg",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export { restaurantMapIcon, driverMapIcon, personMapIcon, markerMapIcon };
