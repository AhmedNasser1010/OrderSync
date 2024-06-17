import { useState, useEffect } from 'react'
import styled from 'styled-components'

import priceAfterDiscount from '../utils/priceAfterDiscount'

const Container = styled.div`
	overflow: hidden;
	cursor: pointer;
	transition: 0.3s;

	&:hover {
		transform: scale(0.9);
	}
`
const PerviewImage = styled.div`
	margin-bottom: 10px;
	position: relative;
`
const Discount = styled.span`
	position: absolute;
	bottom: 5px;
	left: 10px;
	color: white;
	font-weight: 900;
`
const TextContent = styled.div`
	padding: 0 10px;
`
const Title = styled.h4`
	margin-bottom: 5px;
`
const RatingContainer = styled.div`
	margin-bottom: 5px;
	display: flex;
	align-items: center;
`
const Category = styled.span`
	display: flex;
	align-items: center;
	justify-content: space-between;
`
const Price = styled.span`
	display: flex;
	gap: 0.5rem;
	user-select: none;

	& p .line {
		width: 3px;
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
const PriceAfter = styled.span``

function MenuCard({ style, onMouseUp, data }) {
	const { id, title, perviewImage, rating, category, price, discount } = data

	return (

		<Container
			style={style}
			onMouseUp={onMouseUp}
		>
			<PerviewImage>
				<img src={perviewImage} alt="perview image" style={{ width: '100%', borderRadius: '15px' }} />
				<Discount>{ discount?.message }</Discount>
			</PerviewImage>
			<TextContent>
				<Title>{ title }</Title>
				<RatingContainer>
					<svg style={{ marginRight: '5px' }} width="20" height="20" viewBox="0 0 20 20" fill="none" role="img" aria-hidden="true" strokecolor="rgba(2, 6, 12, 0.92)" fillcolor="rgba(2, 6, 12, 0.92)"><circle cx="10" cy="10" r="9" fill="url(#StoreRating20_svg__paint0_linear_32982_71567)"></circle><path d="M10.0816 12.865C10.0312 12.8353 9.96876 12.8353 9.91839 12.865L7.31647 14.3968C6.93482 14.6214 6.47106 14.2757 6.57745 13.8458L7.27568 11.0245C7.29055 10.9644 7.26965 10.9012 7.22195 10.8618L4.95521 8.99028C4.60833 8.70388 4.78653 8.14085 5.23502 8.10619L8.23448 7.87442C8.29403 7.86982 8.34612 7.83261 8.36979 7.77777L9.54092 5.06385C9.71462 4.66132 10.2854 4.66132 10.4591 5.06385L11.6302 7.77777C11.6539 7.83261 11.706 7.86982 11.7655 7.87442L14.765 8.10619C15.2135 8.14085 15.3917 8.70388 15.0448 8.99028L12.7781 10.8618C12.7303 10.9012 12.7095 10.9644 12.7243 11.0245L13.4225 13.8458C13.5289 14.2757 13.0652 14.6214 12.6835 14.3968L10.0816 12.865Z" fill="white"></path><defs><linearGradient id="StoreRating20_svg__paint0_linear_32982_71567" x1="10" y1="1" x2="10" y2="19" gradientUnits="userSpaceOnUse"><stop stopColor="#21973B"></stop><stop offset="1" stopColor="#128540"></stop></linearGradient></defs></svg>
					{ rating }
				</RatingContainer>
				<Category>
					<p>{ category }</p>
					<Price>
						{ !discount &&
							<p>
								<span className="number">{ price }</span>
								<span className="symbol">£</span>
							</p>
						}
						{
							discount &&
								<>
									<p style={{ position: 'relative', opacity: '0.7' }}>
										<span className="number" style={{ color: '#F44336' }}>{ price }</span>
										<span className="symbol" style={{ color: '#F44336' }}>£</span>
										<span className="line"></span>
									</p>
									<PriceAfter className="number" style={{ color: '#00a53e' }}>
										{ priceAfterDiscount(price, discount?.code)}
										<span className="symbol" style={{ color: '#00a53e' }}>£</span>
									</PriceAfter>
								</>
						}
						</Price>
				</Category>
			</TextContent>
		</Container>

	)
}

export default MenuCard