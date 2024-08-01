import { useMap } from 'react-leaflet'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'

import MapButton from './MapButton'

function LocationButton({ addMarker }) {
	const { t } = useTranslation()
	const map = useMap()

	const sucsessCallback = (position) => {
		const latlng = [position.coords.latitude, position.coords.longitude]
		if (latlng) {
			map.flyTo(latlng, 15)
			addMarker(latlng)
		} else {
			console.warn(t('Location not available yet.'))
		}
	}

	const errorCallback = (error) => {
		console.error('Error getting location:', error)
	}

	const options = {
		enableHighAccuracy: true
	}

	const findMyLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(sucsessCallback, errorCallback, options)
		} else {
			console.warn(t('Geolocation is not supported by this browser.'))
		}
	}

	return (
		<MapButton
			onMouseUp={findMyLocation}
			label={t('Find My Location')}
			startIcon={<FontAwesomeIcon icon={faLocationDot} className='start-icon' />}
		/>
	)
}

export default LocationButton