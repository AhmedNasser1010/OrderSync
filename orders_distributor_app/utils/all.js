const startMsg = require('./startMsg.js')
const exitApp = require('./exitApp.js')
const restartApp = require('./restartApp.js')
const auto = require('./auto.js')
const unknownCommand = require('./unknownCommand.js')
const logs = require('./logs.js')
const getDriversData = require('./getDriversData.js')
const newDriver = require('./newDriver.js')
const drivers = require('./drivers.js')
const onStartApp = require('./onStartApp.js')
const getDistanceFromLatlngInKm = require('./getDistanceFromLatlngInKm.js')


module.exports = {
	startMsg,
	exitApp,
	restartApp,
	auto,
	unknownCommand,
	logs,
	getDriversData,
	newDriver,
	drivers,
	onStartApp,
	getDistanceFromLatlngInKm
}