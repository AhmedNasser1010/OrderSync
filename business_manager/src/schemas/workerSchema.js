const workerSchema = (data) => {
	const { accessToken, email, name, phone, role, uid } = data

	return {
		accessToken,
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
		partnerId: import.meta.env.VITE_PARTNER_ID,
		userInfo: {
			email,
			name,
			phone,
			role
		}
	}
}

export default workerSchema