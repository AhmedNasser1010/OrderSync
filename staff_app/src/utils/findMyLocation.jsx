const findMyLocation = async () => {
	if (!navigator.geolocation) {
		console.warn('Geolocation is not supported by this browser.')
		return [null, null]
	}

	try {
		const position = await new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(resolve, reject)
		})

		return [position.coords.latitude, position.coords.longitude]
	} catch (error) {
		console.error('Error getting location:', error)
		return [null, null]
	}
}

export default findMyLocation
