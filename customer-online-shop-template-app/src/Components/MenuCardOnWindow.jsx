import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { addToCart } from '../rtk/slices/cartSlice'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'

import priceAfterDiscount from '../utils/priceAfterDiscount'

const Container = styled.div`
	display: flex;
	gap: 1rem;
`
const ImageSide = styled.div`
	position: relative;
	&>img {
		border-radius: 8px;
	}
`
const ContentSide = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`
const ContentSideTop = styled.div``
const ContentSideBottom = styled.div``

const Title = styled.h3`
	font-size: 30px;
	font-weight: 500;
	letter-spacing: 1px;
	margin-bottom: 15px;
`
const Description = styled.p`
	max-width: 90%;
	line-height: 25px;
	color: #3f3f3f;
`
const Rating = styled.div`
	margin-bottom: 5px;
	display: flex;
	align-items: center;
`
const Category = styled.span`
	display: flex;
	align-items: center;
	justify-content: space-between;

	& div p {
		color: #535353;
		margin-bottom: 5px;
	}
`
const Price = styled.span`
	display: flex;
	gap: 2rem;
	align-items: flex-end;
	user-select: none;

	& p .number {
		font-size: 35px;
		font-weight: bold;
	}

	& p .symbol {
		font-size: 18px;
		font-weight: bold;
	}

	& p .line {
		width: 5px;
    height: 110%;
    position: absolute;
    top: 0;
    left: 50%;
    background-color: #F44336;
    border-radius: 10px;
    transform: rotate(25deg) translateX(-50%);
    opacity: 0.5;
	}
`
const Quantity = styled.div`
	display: flex;
	gap: 1rem;

	& svg {
		cursor: pointer;
	}
`
const Discount = styled.span`
	position: absolute;
	bottom: 5px;
	left: 5px;
	color: white;
	font-weight: 900;
`
const SubmitBtn = styled.span`
	display: block;
	color: white;
	font-weight: bold;
	background-color: #00a53e;
	padding: 5px 10px;
	border-radius: 5px;
	cursor: pointer;
	font-size: 14px;
	width: 90px;
	text-align: center;
	letter-spacing: 1px;
`

const PriceAfter = styled.span`
	font-size: 35px;
	font-weight: bold;

	& .symbol {
		font-size: 18px;
	}
`

function MenuCardOnWindow({ item, toggleWindow }) {
	const dispatch = useDispatch()
	const { id, title, backgrounds, description, rating, category, price, discount } = item
	const [itemQuantity, setItemQuantity] = useState(1)
	const [itemPrice, setItemPrice] = useState(price)

	const handleAddToCart = () => {
		dispatch(addToCart({
			id: id,
			quantity: itemQuantity
		}))
		toggleWindow()
	}

	const handleItemQuantity = (plus) => {
		if (plus) {
			setItemQuantity(itemQuantity => itemQuantity >= 20 ? itemQuantity : itemQuantity + 1)
			const updatedQuantity = itemQuantity >= 20 ? itemQuantity : itemQuantity + 1
			setItemPrice(itemPrice => updatedQuantity > 20 ? itemPrice : updatedQuantity * price)
		} else {
			setItemQuantity(itemQuantity => itemQuantity > 1 ? itemQuantity - 1 : 1)
			const updatedQuantity = itemQuantity <= 1 ? 1 : itemQuantity - 1
			setItemPrice(itemPrice => updatedQuantity <= 1 ? price : updatedQuantity * price)
		}
	}

	return (

		<Container>
			<ImageSide>
				<img src={backgrounds[0]} alt="item image" />
				<Discount>{ discount?.message }</Discount>
			</ImageSide>
			<ContentSide>
				
				<ContentSideTop>
					<Title>{ title }</Title>
					<Description>{ description }</Description>
				</ContentSideTop>

				<ContentSideBottom>
					<Rating>
						<svg style={{ marginRight: '5px' }} width="20" height="20" viewBox="0 0 20 20" fill="none" role="img" aria-hidden="true" strokecolor="rgba(2, 6, 12, 0.92)" fillcolor="rgba(2, 6, 12, 0.92)"><circle cx="10" cy="10" r="9" fill="url(#StoreRating20_svg__paint0_linear_32982_71567)"></circle><path d="M10.0816 12.865C10.0312 12.8353 9.96876 12.8353 9.91839 12.865L7.31647 14.3968C6.93482 14.6214 6.47106 14.2757 6.57745 13.8458L7.27568 11.0245C7.29055 10.9644 7.26965 10.9012 7.22195 10.8618L4.95521 8.99028C4.60833 8.70388 4.78653 8.14085 5.23502 8.10619L8.23448 7.87442C8.29403 7.86982 8.34612 7.83261 8.36979 7.77777L9.54092 5.06385C9.71462 4.66132 10.2854 4.66132 10.4591 5.06385L11.6302 7.77777C11.6539 7.83261 11.706 7.86982 11.7655 7.87442L14.765 8.10619C15.2135 8.14085 15.3917 8.70388 15.0448 8.99028L12.7781 10.8618C12.7303 10.9012 12.7095 10.9644 12.7243 11.0245L13.4225 13.8458C13.5289 14.2757 13.0652 14.6214 12.6835 14.3968L10.0816 12.865Z" fill="white"></path><defs><linearGradient id="StoreRating20_svg__paint0_linear_32982_71567" x1="10" y1="1" x2="10" y2="19" gradientUnits="userSpaceOnUse"><stop stopColor="#21973B"></stop><stop offset="1" stopColor="#128540"></stop></linearGradient></defs></svg>
						{ rating }
					</Rating>
					<Category>
						<div>
							<p>{ category }</p>
							<SubmitBtn onMouseUp={handleAddToCart}>Place Order</SubmitBtn>
						</div>
						<Price>
							<Quantity>
								<FontAwesomeIcon icon={faPlus} onMouseUp={() => handleItemQuantity(true)} />
								{ itemQuantity }
								<FontAwesomeIcon icon={faMinus} onMouseUp={() => handleItemQuantity(false)} />
							</Quantity>
							{ !discount &&
								<p>
									<span className="number">{ itemPrice }</span>
									<span className="symbol">£</span>
								</p>
							}
							{
								discount &&
									<>
										<p style={{ position: 'relative', opacity: '0.7' }}>
											<span className="number" style={{ color: '#F44336' }}>{ itemPrice }</span>
											<span className="symbol" style={{ color: '#F44336' }}>£</span>
											<span className="line"></span>
										</p>
										<PriceAfter className="number" style={{ color: '#00a53e' }}>
											{ priceAfterDiscount(itemPrice, discount?.code)}
											<span className="symbol" style={{ color: '#00a53e' }}>£</span>
										</PriceAfter>
									</>
							}
						</Price>
					</Category>
				</ContentSideBottom>

			</ContentSide>
		</Container>

	)
}

export default MenuCardOnWindow