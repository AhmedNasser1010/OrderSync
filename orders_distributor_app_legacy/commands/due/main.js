const unknownCommand = require('../../utils/unknownCommand')
const { GET_COLLECTION } = require('../../utils/FIRESTORE/DB_CONTROLLERS.js')
const { setValue } = require('../../store.js')

const help = require('./help.js')
const displayDue = require('./displayDue.js')
const decreseNum = require('./decreseNum.js')
const dueToZero = require('./dueToZero.js')

async function due(input) {

	try {
		const drivers = await GET_COLLECTION('drivers')
		setValue('drivers', drivers)

		const displayPattern = /due -\? ([A-Za-z0-9]+)/i
		const dueNumPattern = /due ([A-Za-z0-9]+) ([0-9]+)/i
		const dueZeroPattern = /due ([A-Za-z0-9]+)/i
		const displayMatch = input.match(displayPattern)
		const dueNumMatch = input.match(dueNumPattern)
		const dueZeroMatch = input.match(dueZeroPattern)

		if (input === 'due') {
			help()
			return
		}

		if (displayMatch) {
			displayDue(displayMatch)
			return
		}

		if (dueNumMatch) {
			decreseNum(dueNumMatch)
			return
		}

		if (dueZeroMatch) {
			dueToZero(dueZeroMatch)
			return
		}

		unknownCommand(input)
	} catch(e) {
		console.log(e)
	}
}

module.exports = due