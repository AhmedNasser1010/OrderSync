const customerSchema = ({ uid, name, email, phone, referredBy, avatar, provider, partnerUid }) => {
	return {
		partnerUid: partnerUid || null,
		uid: uid,
		restaurants: [],
		locations: {
			home: {
				latlng: [0, 0],
				address: '',
			},
			selected: 'home',
			city: 'El Ayat',
		},
		userInfo: {
			role: 'CUSTOMER',
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
			referredBy: referredBy || '',
			isFirstOrder: true,
		},
	}
}

export default customerSchema