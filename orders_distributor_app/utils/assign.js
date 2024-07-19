const { performance } = require('perf_hooks')
const { UPDATE_NESTED_VALUE } = require('./FIRESTORE/DB_CONTROLLERS.js')
const { store } = require('../store.js')
const { debuggingMode } = require('../constants.js')

async function assign(driver, orders) {

	try {
		const start = performance.now()

		const accessToken = orders[0].accessToken
		let ordersAfter = []
		let driverQueue = driver.queue

		for (const order of orders) {
			if (order.assign.driver) throw new Error("<!>This order is assigned before to another driver<!>")
			driver.queue.map(driverQueOrder => { if (driverQueOrder.id === order.id) throw new Error("<!>This order is already assigned before to this driver<!>") })
			orders.map(order => { if (order.accessToken !== accessToken) throw new Error("<!>There is an a order not belonging to same restaurant<!>") })

			const orderAfter = {
				...order,
				assign: {
					...order.assign,
					status: 'delivery',
					driver: driver.uid,
					driverStartAt: Number(Date.now())
				}
			}

			driverQueue = [
				...driver.queue,
				orderAfter
			]

			const currentResOrder = store.orders.values.filter(o => o.accessToken === order.accessToken)
			ordersAfter = [
				...currentResOrder.map(resOrder => {
					if (resOrder.id === order.id) {
						return orderAfter
					} else {
						return resOrder
					}
				})
			]
		}

		const updateDriverPassed = await UPDATE_NESTED_VALUE('drivers', driver.uid, 'queue', driverQueue)
		const updateResOrdersPassed = await UPDATE_NESTED_VALUE('orders', accessToken, 'open', ordersAfter)

		if (!updateDriverPassed) throw new new Error('something wrong happend during update driver queue')
		if (!updateResOrdersPassed) throw new new Error('something wrong happend during update restaurant orders')

		const end = performance.now()
		debuggingMode && console.log(`PASSED  14 ${(end - start).toFixed(2)}ms`)

		return true
	} catch(e) {
		console.log('ASSIGN: Error while "assign", ', e)
		return false
	}
}

module.exports = assign