const readline = require('readline')
const {
	startMsg,
	exitApp,
	restartApp,
	auto,
	unknownCommand,
	logs,
	getDrivers,
	newDriver,
	drivers,
	onStartApp
} = require('./utils/all.js')
const { store, setState, setValue } = require('./store.js')
const test = require('./utils/test.js')
const assign = require('./commands/assign/main.js')
const get = require('./commands/get/main.js')
const storeMapping = require('./commands/storeMapping/main.js')
const due = require('./commands/due/main.js')

onStartApp()

function processInput(input) {
	switch (input.trim().split(' ')[0]) {
		case "clear":
		case "c":
			// process.stdout.write('\u001B[2J\u001B[0;0f')
			console.clear()
			break
		case 'restart':
		case 'r':
			restartApp(store.rl.values)
			break
		case 'on':
			auto('on')
			break
		case 'off':
			auto('off')
			break
		case 'logs':
			logs()
			break
		case 'drivers':
			drivers(input)
			break
		case 'store':
			storeMapping(input)
			break
		case 'get':
			get(input)
			break
		case 'test':
		case 't':
			test()
			break
		case 'assign':
			assign(input)
			break
		case 'due':
			due(input)
			break
		default:
			unknownCommand(input)
	}
}

setState('rl')
setValue('rl', readline.createInterface({
	input: process.stdin,
	output: process.stdout,
}))

store.rl.values.on("line", input => {
	processInput(input)
})