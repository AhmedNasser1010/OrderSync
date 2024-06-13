import randomOrderId from './randomOrderId'

const returnTestOrder = () => {
	return {
		id: randomOrderId(),
		timestamp: Date.now(),
		status: 'RECEIVED',
		payment: {
			method: 'CASH'
		},
		user: {
			phone: '01027380298',
			name: 'Ahmed Nasser',
			comment: 'Hi there this is just a test order',
		},
		cart: [
			{id: 'hukdrgawesbhdf', quantity: 3}, 
			{quantity: 5, id: 'upfthnaerh'}
		],
		location: {
			address: "",
			positions: {
				current: [29.617941, 31.255176],
				custom: [29.620586895840418, 31.25092148780823],
				selected: "custom"
			}
		}
	}
}

export default returnTestOrder