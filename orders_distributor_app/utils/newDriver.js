const askQuestion = require('./askQuestion.js')
const driverSchema = require('./driverSchema.js')
const { SET_DOC } = require('./FIRESTORE/DB_CONTROLLERS.js')

async function newDriver() {
	try {
		
		console.log('New Driver:-')
		const uid = await askQuestion('Driver ID: ')
		const email = await askQuestion('Email: ')
		const name = await askQuestion('Name: ')
		const phone = await askQuestion('Phone: ')

		const driverData = driverSchema({ uid, email, name, phone })

		SET_DOC('drivers', uid, driverData)
		.then(res => {
			if (res) {
				console.log('New driver has been created:-')
				console.log('With ID: ', uid)
				console.log('And Name: ', name)
			} else {
				console.log('1: Error while creating a new driver!')
			}
		})
		.catch(e => {
			console.log('2: Error while creating a new driver!')
			console.error(e)
		})

	} catch(e) {
		console.log('3: Error while creating a new driver!')
		console.error(e)
	}
}

module.exports = newDriver