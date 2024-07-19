const { performance } = require('perf_hooks')
const { debuggingMode } = require('../constants.js')

function randomDriver (drivers) {
	const start = performance.now()
	
	const randomIndex = Math.floor(Math.random() * drivers.length)
	const driver = drivers[randomIndex]

	if (driver) {
		const end = performance.now()
		debuggingMode && console.log(`PASSED  9 ${(end - start).toFixed(2)}ms`)

		return driver
	}

	console.log('ASSIGN: Error while "randomDriver"')
	return null
}

module.exports = randomDriver