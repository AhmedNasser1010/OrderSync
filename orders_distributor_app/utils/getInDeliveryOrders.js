const { performance } = require('perf_hooks')
const { debuggingMode } = require('../constants.js')

async function getInDeliveryOrders(orders) {
	try {
		const start = performance.now()
		
		const filteredOrders = await orders.filter(order => order.status === 'IN_DELIVERY' && order.assign.driver === null && order?.assign?.cancelAutoAssign === false)

		const end = performance.now()
		debuggingMode && console.log(`PASSED  1 ${(end - start).toFixed(2)}ms`)

		return filteredOrders
	} catch(e) {
		console.log('ASSIGN: Error while "getInDeliveryOrders": ', e)
		return []
	}
}

module.exports = getInDeliveryOrders