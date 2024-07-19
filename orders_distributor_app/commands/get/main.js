const unknownCommand = require('../../utils/unknownCommand')
const getRestaurants = require('./getRestaurants')
const getDrivers = require('./getDrivers')
const getOrders = require('./getOrders')


function get(input) {

	if (input === 'get') {
		console.log('Did you mean: get "collectionName"')
		return
	} else if (input === 'get restaurants' || input === 'get res') {
		getRestaurants()
		return
	} else if (input === 'get drivers' || input === 'get dri') {
		getDrivers()
		return
	} else if (input === 'get orders' || input === 'get o') {
		getOrders()
		return
	}

	unknownCommand(input)
}

module.exports = get