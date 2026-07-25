import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import { useSelector, useDispatch } from 'react-redux'
import { addCheckout, clearCheckout } from '../../rtk/slices/checkoutSlice'
import { clearCart, applyOrderDiscount, removeOrderDiscount } from '../../rtk/slices/cartSlice'
import { priceAfterDiscount, resolveItemDiscount } from '@ordersync/order-utils'
import { trackDiscountRedemption } from '../../utils/trackDiscountRedemption'
import { useNavigate } from 'react-router-dom'
import toast from "react-hot-toast"
import { useTranslation } from 'react-i18next'

import Divider from './Divider'
import Tip from './Tip'
import CheckoutMainButton from './CheckoutMainButton'
import CheckoutPageTitle from './CheckoutPageTitle'
import PopupWindow from './PopupWindow'

import usePlaceOrder from '../../hooks/usePlaceOrder'

const Payment = styled.div``
const PromoSection = styled.div`
	display: flex;
	gap: 8px;
	align-items: center;
	margin: 16px 0;
`
const PromoInput = styled.input`
	flex: 1;
	padding: 10px 12px;
	border: 1px solid #979797;
	border-radius: 6px;
	font-size: 14px;
	text-transform: uppercase;
	letter-spacing: 1px;
	&:focus {
		outline: none;
		border-color: #2196F3;
	}
`
const PromoButton = styled.button`
	padding: 10px 16px;
	background-color: ${props => props.applied ? '#F44336' : '#4CAF50'};
	color: white;
	border: none;
	border-radius: 6px;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	white-space: nowrap;
`
const PromoMessage = styled.p`
	font-size: 12px;
	color: ${props => props.error ? '#F44336' : '#4CAF50'};
	margin: 4px 0 0 0;
`
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

function CheckoutUserPayment({ handleCurrentState, res }) {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const placeOrder = usePlaceOrder()
	const cart = useSelector(state => state.checkout.cart)
	const menuItems = useSelector(state => state.menu.items)
	const categories = useSelector(state => state.menu.categories)
	const orderDiscounts = useSelector(state => state.menu.orderDiscounts || [])
	const appliedOrderDiscount = useSelector(state => state.cart.appliedOrderDiscount)
	const user = useSelector(state => state.user)
	const accessToken = useSelector(state => state.cart.restaurant)
	const checkout = useSelector(state => state.checkout)
	const [paymentMethod, setPaymentMethod] = useState('CASH')
	const [total, setTotal] = useState(0)
	const [totalWithDiscount, setTotalWithDiscount] = useState(0)
	const [buttonIsDisable, setButtonIsDisable] = useState(false)
	const [windowIsOpen, setWindowIsOpen] = useState(false)
	const [promoCodeInput, setPromoCodeInput] = useState('')
	const [promoError, setPromoError] = useState('')
	const [promoSuccess, setPromoSuccess] = useState('')

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
		toast.promise(
			placeOrder(checkout, res?.accessToken).then(result => {
				if(result) {
					if (appliedOrderDiscount) {
						trackDiscountRedemption({
							discountId: appliedOrderDiscount.id,
							restaurantId: accessToken,
							userId: user?.uid || '',
							orderId: `order_${Date.now()}`,
							amount: appliedOrderDiscount.type === 'P'
								? totalWithDiscount * (appliedOrderDiscount.value / 100)
								: Math.min(appliedOrderDiscount.value, totalWithDiscount),
						})
					}
					setTimeout(() => navigate('/'), 3500)
					return true
				}
				return false
			}),
			{
				loading: t('Saving...'),
				success: t('Success.'),
				error: t('Could not save your order.'),
			},
			{
				success: {
					duration: 3000
				},
				error: {
					duration: 3000
				},
			}
		)
	}

	const handleOnWindowClose = () => {
		dispatch(clearCheckout())
		dispatch(clearCart())
		navigate('/')
	}

	const handleApplyPromoCode = () => {
		setPromoError('')
		setPromoSuccess('')

		if (!promoCodeInput.trim()) {
			setPromoError('Please enter a promo code')
			return
		}

		const code = promoCodeInput.trim().toUpperCase()
		const foundDiscount = orderDiscounts.find(
			d => d.code.toUpperCase() === code && d.active
		)

		if (!foundDiscount) {
			setPromoError('Invalid promo code')
			return
		}

		if (foundDiscount.expireAt && Date.now() > foundDiscount.expireAt) {
			setPromoError('This promo code has expired')
			return
		}

		if (foundDiscount.startAt && Date.now() < foundDiscount.startAt) {
			setPromoError('This promo code is not active yet')
			return
		}

		if (foundDiscount.usageLimit != null && foundDiscount.usageCount >= foundDiscount.usageLimit) {
			setPromoError('This promo code has reached its usage limit')
			return
		}

		const cartSubtotal = cart?.reduce((sum, cartItem) => {
			const menuItem = menuItems?.find(mi => mi.id === cartItem.id)
			return sum + (menuItem?.price || 0) * cartItem.quantity
		}, 0) || 0

		if (foundDiscount.minOrderTotal && cartSubtotal < foundDiscount.minOrderTotal) {
			setPromoError(`Minimum order total is ${foundDiscount.minOrderTotal}LE`)
			return
		}

		if (foundDiscount.minCartItems) {
			const totalItems = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0
			if (totalItems < foundDiscount.minCartItems) {
				setPromoError(`Minimum ${foundDiscount.minCartItems} items required`)
				return
			}
		}

		dispatch(applyOrderDiscount(foundDiscount))
		setPromoSuccess(`Code "${foundDiscount.code}" applied! ${foundDiscount.message}`)
		setPromoCodeInput('')
	}

	const handleRemovePromoCode = () => {
		dispatch(removeOrderDiscount())
		setPromoSuccess('')
		setPromoError('')
	}

	useEffect(() => {
		dispatch(addCheckout({ payment: { method: 'CASH' } }))

		let total = 0
		let totalWithDiscount = 0

		cart?.map(cartItem => {
			menuItems.map(menuItem => {
				if (cartItem.id === menuItem.id) {
					let subtotal = menuItem.price * cartItem.quantity
					const category = categories?.find(cat => cat.id === menuItem.category)
					const effectiveDiscount = resolveItemDiscount(menuItem, category)
					let subTotalDiscounted = effectiveDiscount
						? priceAfterDiscount(menuItem.price, effectiveDiscount, user, accessToken).finalPrice * cartItem.quantity
						: subtotal

					total += subtotal
					totalWithDiscount += subTotalDiscounted
				}
			})
		})

		let finalTotal = totalWithDiscount + res?.operations?.deliveryTax?.max
		if (appliedOrderDiscount) {
			const orderDiscountAmount = appliedOrderDiscount.type === 'P'
				? totalWithDiscount * (appliedOrderDiscount.value / 100)
				: Math.min(appliedOrderDiscount.value, totalWithDiscount)
			finalTotal = Math.max(0, totalWithDiscount - orderDiscountAmount) + res?.operations?.deliveryTax?.max
		}

		setTotal(total + res?.operations?.deliveryTax?.max)
		setTotalWithDiscount(finalTotal)
	}, [appliedOrderDiscount])

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
			<Tip message={`Delivery Tax Will Be Included ${res?.deliveryTax?.max}LE + Total Price`} icon={<FontAwesomeIcon icon={faCircleExclamation} />} />
			{!appliedOrderDiscount && (
				<PromoSection>
					<PromoInput
						type="text"
						value={promoCodeInput}
						onChange={(e) => setPromoCodeInput(e.target.value)}
						placeholder="Enter promo code"
						onKeyDown={(e) => e.key === 'Enter' && handleApplyPromoCode()}
					/>
					<PromoButton onClick={handleApplyPromoCode}>Apply</PromoButton>
				</PromoSection>
			)}
			{appliedOrderDiscount && (
				<PromoSection>
					<PromoInput
						type="text"
						value={appliedOrderDiscount.code}
						disabled
						style={{ backgroundColor: '#f5f5f5', color: '#4CAF50', fontWeight: 600 }}
					/>
					<PromoButton applied onClick={handleRemovePromoCode}>Remove</PromoButton>
				</PromoSection>
			)}
			{promoError && <PromoMessage error>{promoError}</PromoMessage>}
			{promoSuccess && <PromoMessage>{promoSuccess}</PromoMessage>}
			<TotalPrice>
				<span>Total</span>
				{ !totalWithDiscount && <span>{ total }LE</span> }
				{
					totalWithDiscount &&
						<DiscountPrice>
							<span className='total'>{ total }LE</span>
							<span className='discount' style={{ backgroundColor: 'transparent' }}>{ totalWithDiscount }LE</span>
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