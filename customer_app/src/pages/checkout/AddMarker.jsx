import { useMapEvents } from 'react-leaflet';

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faThumbtack } from '@fortawesome/free-solid-svg-icons'
// import MapButton from './MapButton'

function AddMarker({ addMarker }) {
  useMapEvents({
    click: (e) => {
      addMarker({ latlng: e.latlng, popup: 'Your custom Delivary Position', byUser: true })
    },
  });

  return null
}

// <MapButton
//   label='New Location'
//   style={{ bottom: '50px' }}
//   startIcon={<FontAwesomeIcon icon={faThumbtack} className='start-icon' />}
// />

export default AddMarker