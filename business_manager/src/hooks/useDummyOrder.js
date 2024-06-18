import { useSelector } from 'react-redux'

import randomOrderId from '../functions/randomOrderId'

const useDummyOrder = () => {
	const menu = useSelector(state => state.menu)

	if (menu.items.length <= 0) {
		console.error('The useDummyOrder hook requires menu items to be added first.')
		return false
	} else {
		return {
			id: randomOrderId(),
			timestamp: Date.now(),
			status: 'RECEIVED',
			payment: {
				method: 'CASH'
			},
			user: {
				phone: '01117073085',
				name: 'Ahmed Nasser',
				comment: 'Hi there this is just a test order',
			},
			cart: [
				{id: menu.items[0].id, quantity: 3}
			],
			location: {
				address: "",
				positions: {
					current: [0, 0],
					custom: [29.620586895840418, 31.25092148780823],
					selected: "custom"
				}
			}
		}
	}

}

export default useDummyOrder