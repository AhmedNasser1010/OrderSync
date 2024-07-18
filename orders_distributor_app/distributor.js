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
			drivers(input.trim())
			break
		case 'store':
			console.log(store)
			break
		case 'store state':
			
			break
		case 'test':
		case 't':
			test()
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