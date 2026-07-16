const unknownCommand = require('./unknownCommand')
const newDriver = require('./newDriver')
const getDriversData = require('./getDriversData')
const deleteDriver = require('./deleteDriver')
const updateDriver = require('./updateDriver')

function drivers(input) {

	if (input === 'drivers') {
		getDriversData()
		return
	} else if (input === 'drivers -new') {
		newDriver()
		return
	} else if (input === 'drivers -delete') {
		deleteDriver()
		return
	} else if (input === 'drivers -update') {
		updateDriver()
		return
	}

	unknownCommand(input)
}

module.exports = drivers