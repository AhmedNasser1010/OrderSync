async function getInDeliveryOrders(orders) {
	try {
		const filteredOrders = await orders.filter(order => order.status === 'IN_DELIVERY' && order.assign.driver === null)
		return filteredOrders
	} catch(e) {
		console.log('ASSIGN: Error while "getInDeliveryOrders": ', e)
		return []
	}
}

module.exports = getInDeliveryOrders