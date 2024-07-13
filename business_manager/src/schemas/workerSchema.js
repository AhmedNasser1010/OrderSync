const workerSchema = (data) => {
	const { accessToken, email, name, phone, role, uid } = data

	return {
		accessToken,
		joinDate: Date.now(),
		trackingFeature: role === 'DELIVERY_CAPTAIN' ? true : false,
		online: {
			byManager: true,
			byUser: false
		},
		userInfo: {
			email,
			name,
			phone,
			role,
			uid
		}
	}
}

export default workerSchema