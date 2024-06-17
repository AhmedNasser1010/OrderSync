import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import workingDaysChecker from './utils/workingDaysChecker'

import CheckPoints from './Components/CheckPoints'
import CheckoutUserInfoForm from './Components/CheckoutUserInfoForm'
import CheckoutUserAddress from './Components/CheckoutUserAddress'
import CheckoutUserPayment from './Components/CheckoutUserPayment'
import PopupMsg from './Components/PopupMsg'

const CheckoutContainer = styled.section`
	margin: 50px 150px;
`

function Checkout() {
	const [barProress, setBarProress] = useState(0)
	const [currentState, setCurrentState] = useState("CART_IS_EMPTY")
	const cart = useSelector(state => state.cart)
	const checkout = useSelector(state => state.checkout)
	const businessServices = useSelector(state => state.businessInfo.services)
	const businessSettings = useSelector(state => state.businessInfo.settings)

	const handleCurrentState = (status) => {
		setCurrentState(status)
	}

	useEffect(() => {
		currentState === 'ON_USER_INFO' && setBarProress(0)
		currentState === 'ON_USER_ADDRESS' && setBarProress(50)
		currentState === 'ON_PAYMENT' && setBarProress(100)
	}, [currentState])

	useEffect(() => {
		const isStrictOpen = businessSettings?.siteControl.isStrictOpen
		const openingHours = businessServices?.openingHours
		if (workingDaysChecker(openingHours, isStrictOpen)) {
			checkout.cart?.length ? setCurrentState('ON_USER_INFO') : setCurrentState('CART_IS_EMPTY')
		} else {
			setCurrentState('NOT_AVAILABLE')
		}
	}, [businessServices])

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
			{ currentState === 'NOT_AVAILABLE' && <PopupMsg title='Not Available' subject={businessSettings?.siteControl.closeMsg || `Sorry we are not available right now come back again later.`} button={<Link to="/">Back To Home</Link>} />}
			{ currentState === 'ON_USER_INFO' && <CheckoutUserInfoForm handleCurrentState={handleCurrentState} /> }
			{ currentState === 'ON_USER_ADDRESS' && <CheckoutUserAddress handleCurrentState={handleCurrentState} /> }
			{ currentState === 'ON_PAYMENT' && <CheckoutUserPayment handleCurrentState={handleCurrentState} /> }
		</CheckoutContainer>

	)
}

export default Checkout