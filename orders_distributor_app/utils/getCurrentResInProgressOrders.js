function getCurrentResInProgressOrders(progressOrders, accessToken) {
	const filteredOrders = progressOrders.filter(prog => prog.accessToken === accessToken)
	return filteredOrders
}

module.exports = getCurrentResInProgressOrders