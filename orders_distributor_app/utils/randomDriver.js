function randomDriver (drivers) {
	const randomIndex = Math.floor(Math.random() * drivers.length)
	const driver = drivers[randomIndex]

	if (driver) {
		return driver
	}

	console.log('ASSIGN: Error while "randomDriver"')
	return null
}

module.exports = randomDriver