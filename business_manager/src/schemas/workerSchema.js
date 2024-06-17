const workerSchema = (data) => {
	const { accessToken, email, name, phone, role, uid } = data

	return {
		accessToken,
		joinDate: Date.now(),
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