import { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import workingDaysChecker from '../../utils/workingDaysChecker'

import CheckPoints from './CheckPoints'
import CheckoutUserInfoForm from './CheckoutUserInfoForm'
import CheckoutUserAddress from './CheckoutUserAddress'
import CheckoutUserPayment from './CheckoutUserPayment'
import PopupMsg from './PopupMsg'

const CheckoutContainer = styled.section`
	margin: 100px 150px;
`

function Checkout() {
	const [barProress, setBarProress] = useState(0)
	const [currentState, setCurrentState] = useState("CART_IS_EMPTY")
	const businessID = useSelector(state => state.cart.restaurant)
	const restaurants = useSelector(state => state.restaurants)
	const cart = useSelector(state => state.cart.items)
	const checkout = useSelector(state => state.checkout)

	const res = useMemo(() => {
		return restaurants.filter(restaurant => restaurant.id === businessID)[0]
	}, [businessID, restaurants])

	const handleCurrentState = (status) => {
		setCurrentState(status)
	}

	useEffect(() => {
		currentState === 'ON_USER_INFO' && setBarProress(0)
		currentState === 'ON_USER_ADDRESS' && setBarProress(50)
		currentState === 'ON_PAYMENT' && setBarProress(100)
	}, [currentState])

	useEffect(() => {
		const autoAvailability = res?.settings?.siteControl.autoAvailability
		const openingHours = res?.services?.openingHours
		if (workingDaysChecker(openingHours, autoAvailability)) {
			cart?.length ? setCurrentState('ON_USER_INFO') : setCurrentState('CART_IS_EMPTY')
		} else {
			setCurrentState('NOT_AVAILABLE')
		}
	}, [res])

	return (

		<CheckoutContainer>
			{ currentState === 'ON_USER_INFO' || currentState === 'ON_USER_ADDRESS' || currentState === 'ON_PAYMENT' &&
				<CheckPoints
					steps={['Contact', 'Address', 'Payment']}
					progress={barProress}
					themeColorFill='#60b246'
					themeColorEmpty='#eee'
				/>
			}

			{ currentState === 'CART_IS_EMPTY' &&  <PopupMsg title='Empty Cart' subject='Your cart is empty continue shopping and come back again' button={<Link to="/">Continue Shopping</Link>} />}
			{ currentState === 'NOT_AVAILABLE' && <PopupMsg title='Not Available' subject={res?.settings?.siteControl.closeMsg || `Sorry we are not available right now come back again later.`} button={<Link to="/">Back To Home</Link>} />}
			{ currentState === 'ON_USER_INFO' && <CheckoutUserInfoForm handleCurrentState={handleCurrentState} /> }
			{ currentState === 'ON_USER_ADDRESS' && <CheckoutUserAddress handleCurrentState={handleCurrentState} /> }
			{ currentState === 'ON_PAYMENT' && <CheckoutUserPayment handleCurrentState={handleCurrentState} res={res} /> }
		</CheckoutContainer>

	)
}

export default Checkout