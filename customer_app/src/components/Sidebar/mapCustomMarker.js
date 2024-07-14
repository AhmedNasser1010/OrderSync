import L from 'leaflet'
import resIcon from '../../../public/assets/shop-svgrepo-com.svg'
import driverIcon from '../../../public/assets/motor-scooter-svgrepo-com.svg'
import personIcon from '../../../public/assets/person-boy-svgrepo-com.svg'

// Define custom icon
const restaurantMapIcon = L.icon({
  iconUrl: resIcon,
  iconSize: [32, 32], // size of the icon
  iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -32], // point from which the popup should open relative to the iconAnchor
})

const driverMapIcon = L.icon({
  iconUrl: driverIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

const personMapIcon = L.icon({
  iconUrl: personIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

export { restaurantMapIcon, driverMapIcon, personMapIcon }