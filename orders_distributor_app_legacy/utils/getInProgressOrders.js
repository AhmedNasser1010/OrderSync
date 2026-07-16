const { performance } = require('perf_hooks')
const { debuggingMode } = require('../constants.js')

function getInProgressOrders (orders) {
	const start = performance.now()
	
	const filteredOrders = orders.filter(order => order.status === 'PREPARING' && order.assign.driver === null)

	if (filteredOrders.length) {
		const end = performance.now()
		debuggingMode && console.log(`PASSED  10 ${(end - start).toFixed(2)}ms`)

		return filteredOrders
	}

	const end = performance.now()
	debuggingMode && console.log(`PASSED  10 ${(end - start).toFixed(2)}ms`)
	return []
}

module.exports = getInProgressOrders