const askQuestion = require('./askQuestion.js')
const { DELETE_DOC } = require('./FIRESTORE/DB_CONTROLLERS.js')

async function deleteDriver() {
	try {
		
		console.log('Delete Driver:-')
		const uid = await askQuestion('Driver ID: ')

		DELETE_DOC('drivers', uid)
		.then(res => {
			if (res) {
				console.log('The driver has been deleted:-')
				console.log('With ID: ', uid)
			} else {
				console.log('1: Error while deleting the driver!')
			}
		})
		.catch(e => {
			console.log('2: Error while deleting the driver!')
			console.error(e)
		})

	} catch(e) {
		console.log('3: Error while deleting the driver!')
		console.error(e)
	}
}

module.exports = deleteDriver