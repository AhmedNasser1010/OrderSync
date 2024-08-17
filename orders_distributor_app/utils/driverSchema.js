const { store } = require('../store.js')

function driverSchema(data) {
	const { email, name, phone, uid } = data

	return {
		uid,
		joinDate: Date.now(),
		ordersDues: 0,
		partnerUid: store.user.values.userInfo.uid,
		online: {
			byManager: true,
			byUser: false
		},
		liveLocation: [0, 0],
		queue: [],
		userInfo: {
			email,
			name,
			phone,
			role: 'DRIVER',
			vehicle: 'MOTORCYCLE'
		}
	}
}

module.exports = driverSchema