const workerSchema = (data) => {
	const { partnerUid, accessToken, email, name, phone, role, uid } = data

	return {
		accessToken,
		partnerUid,
		joinDate: Date.now(),
		trackingFeature: role === 'DRIVER' ? true : false,
		ordersDues: 0,
		online: {
			byManager: true,
			byUser: false
		},
		liveLocation: [0, 0],
		queue: [],
		sync: 'LOCAL',
		uid,
		userInfo: {
			email,
			name,
			phone,
			role
		}
	}
}

export default workerSchema