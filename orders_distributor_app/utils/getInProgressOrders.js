function getInProgressOrders (orders) {
	const filteredOrders = orders.filter(order => order.status === 'IN_PROGRESS' && order.assign.driver === null)

	if (filteredOrders.length) {
		return filteredOrders
	}

	return []
}

module.exports = getInProgressOrders