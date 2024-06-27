const customerSchema = ({ uid, name, email, phone, refferredBy, avatar, provider }) => {
	return {
		restaurants: [],
		locations: {
			home: {
				latlng: [null, null],
				address: '',
			},
			selected: 'home',
			city: 'El Ayat',
		},
		userInfo: {
			name: name || '',
			email: email || '',
			phone: phone || '',
			secondPhone: '',
			avatar: avatar || '',
			uid: uid,
			provider
		},
		referral: {
			successReferred: [],
			referredBy: refferredBy || '',
			isFirstOrder: true,
		},
	}
}

export default customerSchema