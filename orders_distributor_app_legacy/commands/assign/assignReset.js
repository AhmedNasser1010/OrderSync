const { performance } = require('perf_hooks')
const { UPDATE_NESTED_VALUE, SET_DOC } = require('../../utils/FIRESTORE/DB_CONTROLLERS.js')
const assignLog = require('../../utils/assignLog.js')
const { store } = require('../../store.js')

function assignReset(isForce) {
	const start = performance.now()

	const allArdersAfter = [
		...store.orders.values.map(order => {
			return {
				...order,
				assign: {
					...order.assign,
					driver: null,
					driverStartAt: null,
					cancelAutoAssign: isForce
				}
			}
		})
	]

	store.user.values.data.businesses.map(accessToken => {
		const currentBusienssOrders = allArdersAfter.filter(order => order.accessToken === accessToken)
		if (currentBusienssOrders.length) {
			UPDATE_NESTED_VALUE('orders', accessToken, 'open', currentBusienssOrders)
		}
	})

	store.drivers.values.map(driver => {
		if (driver.queue.length) {
			const driverAfter = {
				...driver,
				queue: []
			}
			SET_DOC('drivers', driver.uid, driverAfter)
		}
	})



	const end = performance.now()
	assignLog.done((end - start).toFixed(0))
}

module.exports = assignReset