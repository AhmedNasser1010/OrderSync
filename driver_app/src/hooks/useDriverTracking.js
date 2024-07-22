import { useEffect, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux' 

import findMyLocation from '../utils/findMyLocation'
import getDistanceFromLatlngInKm from '../utils/getDistanceFromLatlngInKm'
import DB_UPDATE_NESTED_VALUE from '../utils/DB_UPDATE_NESTED_VALUE'

const useDriverTracking = () => {
	const dispatch = useDispatch()
	const user = useSelector(state => state.user)
	const updateTime = 120000
	const locationInterval = useRef(null)
	let lastLocation = useRef([null, null])

	const driverTracking = () => {
		if (user?.accessToken && user?.trackingFeature) {
			locationInterval.current = setInterval(async () => {
				let newLocation = [null, null]
				
				try {
					const location = await findMyLocation()
					newLocation = location
				} catch (error) {
					console.error('Error finding location:', error)
				}

				const isOnline = user?.online?.byUser && user?.online?.byManager
				const notNull = newLocation[0] !== null && newLocation[1] !== null
				const isFarther150Meter = getDistanceFromLatlngInKm(lastLocation.current, newLocation) >= 0.150

				if (isOnline && notNull && isFarther150Meter) {
					lastLocation.current = newLocation
					DB_UPDATE_NESTED_VALUE('drivers', user.userInfo.uid, 'liveLocation', newLocation)
				}
			}, updateTime)
		}
	}

	const clearTracking = () => {
		clearInterval(locationInterval.current)
	}

	return { driverTracking, clearTracking }
}

export default useDriverTracking