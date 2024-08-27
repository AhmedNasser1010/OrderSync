import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import Control from 'react-leaflet-custom-control'
import 'leaflet/dist/leaflet.css'
import styled from 'styled-components'

import { markerMapIcon } from './mapCustomMarker'
import LocationButton from './LocationButton'
import AddMarker from './AddMarker'

const MapContainerStyled = styled(MapContainer)`
  z-index: 0;
  width: 100%;
  height: 400px;
  position: relative;
`

function FindUserLocationMap({ userLocation, defaultLocation, onChange }) {
  const [centerLocation, setCenterLocation] = useState(userLocation || defaultLocation)
  const [markers, setMarkers] = useState([])
  const mapRef = useRef()

  const addMarker = (mark) => {
    const clearMarkers = markers.filter((mark) => !mark.byUser)
    setMarkers(clearMarkers)
    setMarkers((current) => [...current, { latlng: mark, popup: 'Home location', byUser: true }])
    const notSameLocation = userLocation === null || (mark[0] !== userLocation[0] && mark[1] !== userLocation[1])
    notSameLocation && onChange(mark)

  }

  useEffect(() => {
    if (userLocation) {
      setCenterLocation(userLocation)
      addMarker(userLocation)
    }
  }, [userLocation])

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(centerLocation, 18, { animate: true })
    }
  }, [centerLocation])

  return (
    <MapContainerStyled center={centerLocation} zoom={18} scrollWheelZoom={true} ref={mapRef}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://ahmed-nasser.netlify.app/" target="_blank">Ahmed Nasser</a> OrderSync Systems'
      />
      {markers?.map((mark, idx) => (
        <Marker key={idx} position={mark?.latlng} icon={markerMapIcon}>
          <Popup>{mark.popup}</Popup>
        </Marker>
      ))}
      <AddMarker addMarker={addMarker} />
      <Control position="topright">
        <LocationButton addMarker={addMarker} />
      </Control>
    </MapContainerStyled>
  )
}

export default FindUserLocationMap
