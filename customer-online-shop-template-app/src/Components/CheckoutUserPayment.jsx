import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import { useSelector, useDispatch } from 'react-redux'
import { addCheckout, clearCheckout } from '../rtk/slices/checkoutSlice'
import { clearCart } from '../rtk/slices/cartSlice'
import priceAfterDiscount from '../utils/priceAfterDiscount'
import { useNavigate } from 'react-router-dom'

import Divider from './Divider'
import Tip from './Tip'
import CheckoutMainButton from './CheckoutMainButton'
import CheckoutPageTitle from './CheckoutPageTitle'
import PopupWindow from './PopupWindow'

// const {
//   API_URL,
//   X_SECRET_KEY
// } = process.env;

const API_URL = 'http://localhost:3000/api/'
const X_SECRET_KEY = 'c7075de1-4683-4844-93f4-e1518044330a_JQMI4Qnft7WKe56Yg5bkjtTQsAA3'

const Payment = styled.div``
const RadioFormWrapper = styled.div`
	display: flex;
	row-gap: 1rem;
	flex-wrap: wrap;
	justify-content: space-between;
	user-select: none;
`
const RadioInputWrapper = styled.label`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
	border: 1px solid #979797;
	border-radius: 6px;
	padding: 30px 0;
	width: calc(100% / 2 - 10px);
	cursor: pointer;
	transition: 0.3s;
`
const RadioTitle = styled.span`
	font-size: 22px;
	font-weight: 300;
`
const Radio = styled.input``
const RadioInputP = styled.p`
	font-size: 13px;
	width: 80%;
	text-align: center;
	color: #616161;
`
const TotalPrice = styled.h3`
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 35px;
	font-weight: 900;
	letter-spacing: 2px;
	margin-bottom: 50px;
	text-align: center;
`
const DiscountPrice = styled.div`
	& .total {
		font-size: 20px;
		margin-right: 10px;
		color: #F44336;
	}
	& .discount {
		color: #60b246;
	}
`
const StyledWindow = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;
	gap: 1.5rem;
	max-width: 400px;

	& svg {
		width: 200px;
	}

	& p {
		text-align: center;
    font-size: 17px;
    line-height: 24px;
    max-width: 70%;
    font-weight: bold;
	}
`

function CheckoutUserPayment({ handleCurrentState }) {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const cart = useSelector(state => state.checkout.cart)
	const menuItems = useSelector(state => state.menu.items)
	const checkout = useSelector(state => state.checkout)
	const businessServices = useSelector(state => state.businessInfo.services)
	const [paymentMethod, setPaymentMethod] = useState('CASH')
	const [total, setTotal] = useState(0)
	const [totalWithDiscount, setTotalWithDiscount] = useState(0)
	const [buttonIsDisable, setButtonIsDisable] = useState(false)
	const [windowIsOpen, setWindowIsOpen] = useState(false)

	const handleOnRadioChange = (e) => {
		setPaymentMethod(e.target.value)
		dispatch(addCheckout({ payment: { method: e.target.value } }))
	}

	const handleOrderApiResponse = (result) => {
		if (result.code !== 200) setButtonIsDisable(false)
		if (result.code === 200) setWindowIsOpen(true)
	}

	const handlePlaceOrder = () => {
		setButtonIsDisable(true)

		const myHeaders = new Headers()
		myHeaders.append("x-secret-key", X_SECRET_KEY)
		myHeaders.append("Content-Type", "application/json")

		const raw = JSON.stringify(checkout)

		const requestOptions = {
		  method: "POST",
		  headers: myHeaders,
		  body: raw,
		  redirect: "follow"
		};

		fetch(`${API_URL}new-order`, requestOptions)
		  .then(response => response.json())
		  .then(result => {
		  	handleOrderApiResponse(result)
		  	return result !== 200 && result.message
		  })
		  .catch(error => console.error(error))
	}

	const handleOnWindowClose = () => {
		dispatch(clearCheckout())
		dispatch(clearCart())
		navigate('/')
	}

	useEffect(() => {
		dispatch(addCheckout({ payment: { method: 'CASH' } }))

		let total = 0
		let totalWithDiscount = 0

		cart?.map(cartItem => {
			menuItems.map(menuItem => {
				if (cartItem.id === menuItem.id) {
					let subtotal = menuItem.price * cartItem.quantity
					let subTotalDiscounted = menuItem.discount ? priceAfterDiscount(menuItem.price, menuItem.discount.code) * cartItem.quantity : subtotal

					total += subtotal
					totalWithDiscount += subTotalDiscounted
				}
			})
		})

		setTotal(total + businessServices.deliveryTax)
		setTotalWithDiscount(totalWithDiscount + businessServices.deliveryTax)
	}, [])

	return (

		<Payment>
			<CheckoutPageTitle title='Payment Method' />
			<RadioFormWrapper>
				<RadioInputWrapper htmlFor='cash' style={{ borderColor: paymentMethod === 'CASH' && 'blue' }}>
					<Radio
						id='cash'
						type='radio'
						name='cash'
						value='CASH'
						checked={paymentMethod === 'CASH'}
						onChange={handleOnRadioChange}
					/>
					<RadioTitle>Cash Payment</RadioTitle>
					<RadioInputP>
						Pay your order to the delivery captain.
					</RadioInputP>
				</RadioInputWrapper>
				<RadioInputWrapper htmlFor='visa' style={{ borderColor: paymentMethod === 'ONLINE' && 'blue' }}>
					<Radio
						id='visa'
						type='radio'
						name='visa'
						value='ONLINE'
						checked={paymentMethod === 'ONLINE'}
						onChange={handleOnRadioChange}
					/>
					<RadioTitle>Online Payment</RadioTitle>
					<RadioInputP>
						Pay online with, Visa or Vodafone Cash.
					</RadioInputP>
				</RadioInputWrapper>
			</RadioFormWrapper>
			<Divider />
			<Tip message={`Delivery Tax Will Be Included ${businessServices.deliveryTax}LE + Total Price`} icon={<FontAwesomeIcon icon={faCircleExclamation} />} />
			<TotalPrice>
				<span>Total</span>
				{ !totalWithDiscount && <span>{ total }LE</span> }
				{
					totalWithDiscount &&
						<DiscountPrice>
							<span className='total'>{ total }LE</span>
							<span className='discount'>{ totalWithDiscount }LE</span>
						</DiscountPrice>
				}
			</TotalPrice>
			<Divider />
			<CheckoutMainButton
				nextLabel='Place Order'
				backLabel='Back To Address'
				nextBtnIsDisable={buttonIsDisable}
				nextEventCallback={handlePlaceOrder}
				backEventCallback={() => handleCurrentState('ON_USER_ADDRESS')}
			/>
			{
				windowIsOpen &&
					<PopupWindow
						isOpen={windowIsOpen}
						onWindowClose={handleOnWindowClose}
					>
						<StyledWindow>
							<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 50.00 50.00" xmlSpace="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle style={{ fill: '#25AE88' }} cx="25" cy="25" r="25"></circle> <polyline style={{ fill: 'none', stroke: '#FFFFFF', strokeWidth: '4.2', strokeLinecap: 'round', strokeLinejoin: 'round', strokeMiterlimit: '10' }} points=" 38,15 22,33 12,25 "></polyline> </g></svg>
							<p>Successfully received your order. The delivery captain will contact you when your order is ready.</p>
						</StyledWindow>
					</PopupWindow>
			}
		</Payment>

	)
}

export default CheckoutUserPayment