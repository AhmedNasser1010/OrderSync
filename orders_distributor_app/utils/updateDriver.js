const askQuestion = require('./askQuestion.js')
const driverSchema = require('./driverSchema.js')
const { SET_DOC, GET_DOC, DELETE_DOC } = require('./FIRESTORE/DB_CONTROLLERS.js')

async function updateDriver() {
	try {
		
		const givenUid = await askQuestion('Driver ID To Update: ')

		const currentUserData = await GET_DOC('drivers', givenUid)
		.then(res => {
			if (res) {
				return res
			} else {
				console.log('Driver not found!')
				return null
			}
		})

		if (!currentUserData) {
			console.log('Driver not found!')
			return
		}

		console.log('Update Driver:-')
		const uid = await askQuestion('Driver ID: ', currentUserData.uid)
		const email = await askQuestion('Email: ', currentUserData.userInfo.email)
		const name = await askQuestion('Name: ', currentUserData.userInfo.name)
		const phone = await askQuestion('Phone: ', currentUserData.userInfo.phone)

		const userAfter = {
			...currentUserData,
			uid,
			userInfo: {
				...currentUserData.userInfo,
				email,
				name,
				phone
			}
		}

		if (JSON.stringify(currentUserData) === JSON.stringify(userAfter)) {
			console.log('=> There is no changes to be updated!')
			return
		}


		console.log('the deleted id is ', currentUserData.uid)
		DELETE_DOC('drivers', currentUserData.uid)
		.then(res => {
			if (res) {
				console.log(res)

				SET_DOC('drivers', uid, userAfter)
				.then(res => {
					if (res) {
						console.log('Driver data has been updated:-')
						console.log('With ID: ', uid)
						console.log('And Name: ', name)
					} else {
						console.log('1: Error while updating the driver!')
					}
				})
				.catch(e => {
					console.log('2: Error while updating the driver!')
					console.error(e)
				})

			} else {
				console.log('1: Error while updating driver deleting phase!')
			}
		})
		.catch(e => {
			console.log('2: Error while updating driver deleting phase!')
			console.error(e)
		})


	} catch(e) {
		console.log('3: Error while updating the driver!')
		console.error(e)
	}
}

module.exports = updateDriver