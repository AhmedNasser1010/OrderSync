const { performance } = require('perf_hooks')
const { UPDATE_NESTED_VALUE, GET_DOC } = require('../../utils/FIRESTORE/DB_CONTROLLERS.js')
const assignLog = require('../../utils/assignLog.js')
const { store } = require('../../store.js')

async function assignTo(orderId, driverId) {

	try {
		const start = performance.now()

		const currentOrder = store.orders.values.filter(order => order.id === orderId)[0]
		if (!currentOrder) throw new Error('order id is not found!')
		if (currentOrder.assign.driver) throw new Error("<!>This order is assigned before to another driver<!>")
		const currentDriver = store.drivers.values.filter(driver => driver.uid === driverId)[0]
		if (!currentOrder) throw new Error('driver id is not found!')
		currentDriver.queue.map(driverQueOrder => { if (driverQueOrder.id === order.id) throw new Error("<!>This order is already assigned before to this driver<!>") })

		const accessToken = currentOrder.accessToken
		const currentResOrders = store.orders.values.filter(o => o.accessToken === accessToken)

		let ordersAfter = []
		let driverQueue = currentDriver.queue

		const orderAfter = {
			...currentOrder,
			assign: {
				...currentOrder.assign,
				status: 'delivery',
				driver: driverId,
				driverStartAt: Number(Date.now())
			}
		}

		driverQueue = [
			...currentDriver.queue,
			orderAfter
		]

		ordersAfter = [
			...currentResOrders.map(resOrder => {
				if (resOrder.id === orderId) {
					return orderAfter
				} else {
					return resOrder
				}
			})
		]

		const updateDriverPassed = await UPDATE_NESTED_VALUE('drivers', driverId, 'queue', driverQueue)
		if (!updateDriverPassed) throw new new Error('something wrong happend during update driver queue')

		const updateResOrdersPassed = await UPDATE_NESTED_VALUE('orders', accessToken, 'open', ordersAfter)
		if (!updateResOrdersPassed) throw new new Error('something wrong happend during update restaurant orders')


		const end = performance.now()
		assignLog.done((end - start).toFixed(0), [{id: orderId}], {uid: driverId})
		return true
	} catch(e) {
		assignLog.error(null, [{id: orderId}], {uid: driverId}, e)
		console.error(e)
		return false
	}
}

module.exports = assignTo