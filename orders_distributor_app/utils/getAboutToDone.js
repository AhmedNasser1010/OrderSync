const timestampsDifferenceInMs = require('./timestampsDifferenceInMs')

function getAboutToDone(orders, cookTime) {
	if (!orders.length) return []

	const filteredOrders = []

	for (const order of orders) {
		const acceptedPassedTime = cookTime[0] / 1.2
		const dirrerenceTimestamp = timestampsDifferenceInMs(order.statusUpdateAgo, Date.now())
		const differenceInMs = new Date(dirrerenceTimestamp).getMinutes() * 1000

		differenceInMs > acceptedPassedTime && filteredOrders.push(order)

	}

	if (filteredOrders.length >= 4) return filteredOrders.slice(0, 3)
	return filteredOrders
}

module.exports = getAboutToDone