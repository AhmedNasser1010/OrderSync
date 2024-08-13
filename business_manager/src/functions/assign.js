import DB_UPDATE_NESTED_VALUE from './DB_UPDATE_NESTED_VALUE'
import DB_GET_DOC from './DB_GET_DOC'

const assignTo = async (driver, order, updatedDriver, currentResOrders) => {
	try {
		let driverQueue = updatedDriver.queue
		const orderAfter = {
			...order,
			assign: {
				...order.assign,
				status: 'on-delivery',
				driver: driver.uid,
				driverStartAt: Number(Date.now())
			}
		}

		driverQueue = [
			...updatedDriver.queue,
			orderAfter
		]

		const ordersAfter = currentResOrders.map(resOrder => {
			if (resOrder.id === order.id) {
				return orderAfter
			} else {
				return resOrder
			}
		})

		const updateDriverPassed = await DB_UPDATE_NESTED_VALUE('drivers', driver.uid, 'queue', driverQueue)
		const updateResOrdersPassed = await DB_UPDATE_NESTED_VALUE('orders', order.accessToken, 'open', ordersAfter)

		if (!updateDriverPassed) throw new new Error('something wrong happend during update driver queue')
		if (!updateResOrdersPassed) throw new new Error('something wrong happend during update restaurant orders')

	return true
	} catch(e) {
		console.log(e)
		return false
	}
}

const unAssign = async (driver, order, updatedDriver, currentResOrders, isAddedBeforeOrder) => {
	try {
		let driverQueue = updatedDriver.queue
		const orderAfter = {
			...order,
			assign: {
				...order.assign,
				status: 'pickup',
				driver: null
			}
		}

		driverQueue = updatedDriver.queue.filter(qOrder => qOrder.id !== isAddedBeforeOrder.id) || []

		const ordersAfter = currentResOrders.map(resOrder => {
			if (resOrder.id === order.id) {
				return orderAfter
			} else {
				return resOrder
			}
		})

		const updateDriverPassed = await DB_UPDATE_NESTED_VALUE('drivers', driver.uid, 'queue', driverQueue)
		const updateResOrdersPassed = await DB_UPDATE_NESTED_VALUE('orders', order.accessToken, 'open', ordersAfter)

		if (!updateDriverPassed) throw new new Error('something wrong happend during update driver queue')
		if (!updateResOrdersPassed) throw new new Error('something wrong happend during update restaurant orders')

		return true
	} catch(e) {
		console.log('ASSIGN: Error while "unAssign", ', e)
		return false
	}
}

const assign = (driver, order, currentResOrders, updatedDriver) => {
	const accessToken = order.accessToken
	let driverQueue = driver.queue

	const isAddedBeforeOrder = updatedDriver.queue.find(qOrder => qOrder.id === order.id)

	if (isAddedBeforeOrder) {
		unAssign(driver, order, updatedDriver, currentResOrders, isAddedBeforeOrder)
		return
	}



	// if (order?.assign?.driver) {
	// 	const lastAssignedDriver = await DB_GET_DOC('drivers', order.assign.driver)
	// 	const lastDriverUpdatedQue = lastAssignedDriver.queue.filter(que => que.id !== order.id)
	// 	const removeOrderFromLastDriver = await DB_UPDATE_NESTED_VALUE('drivers', order.assign.driver, 'queue', lastDriverUpdatedQue)

	// 	if (removeOrderFromLastDriver === false) throw new Error('error while deleting current order from last driver queue')
	// }

	// if (order.accessToken !== accessToken) throw new Error("<!>There is an a order not belonging to same restaurant<!>")

	assignTo(driver, order, updatedDriver, currentResOrders)

	return true
}

export default assign