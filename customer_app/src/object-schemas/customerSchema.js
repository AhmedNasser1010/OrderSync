const customerSchema = (user, formData) => {
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
			name: formData?.name,
			phone: user?.phoneNumber,
			secondPhone: '',
			avatar: '',
			uid: user?.uid,
		},
		referral: {
			successReferred: [],
			referredBy: formData?.referral,
			isFirstOrder: true,
		},
	}
}

export default customerSchema