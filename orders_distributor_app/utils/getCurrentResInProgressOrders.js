const { performance } = require('perf_hooks')
const { debuggingMode } = require('../constants.js')

function getCurrentResInProgressOrders(progressOrders, accessToken) {
	const start = performance.now()
	
	const filteredOrders = progressOrders.filter(prog => prog.accessToken === accessToken)

	const end = performance.now()
	debuggingMode && console.log(`PASSED  11 ${(end - start).toFixed(2)}ms`)

	return filteredOrders
}

module.exports = getCurrentResInProgressOrders