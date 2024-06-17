import { useState } from 'react'
import { useMapEvents, Marker } from 'react-leaflet';
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'

import MapButton from './MapButton'

function LocationButton({ handleSetUserCurrentLocation }) {
  const [userLocation, setUserLocation] = useState(null)

  const map = useMapEvents({
    locationfound: (e) => {
      setUserLocation(e.latlng)
      handleSetUserCurrentLocation(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
    },
    click: () => {
      map.locate()
    },
  });

  return (
    <>
      <MapButton
        onMouseUp={() => map.locate()}
        label='Find My Location'
        startIcon={<FontAwesomeIcon icon={faLocationDot} className='start-icon' />}
      />
      { userLocation && <Marker position={userLocation} /> }
    </>
  )
}

export default LocationButton;