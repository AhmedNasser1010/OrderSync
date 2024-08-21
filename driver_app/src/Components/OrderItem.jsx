import { useState, useEffect } from 'react'
import styled from 'styled-components'

const Item = styled.div`
	display: flex;
	gap: 1rem;
	align-items: center;
	justify-content: space-between;
`
const Image = styled.img`
	width: 80px;
	border-radius: 8px;
`
const Content = styled.div`
	width: 100%;

	& h4 {
		font-size: 1.3rem;
	}

	& .quantity {
		font-size: 1.5rem;
	}
`

const Title = styled.h4`
	font-size: large !important;
  font-weight: normal;
`

function OrderItem({ orderItem }) {
	console.log(orderItem)
	return (

		<Item>
			<Image src={orderItem.backgrounds[0]} alt="item image" />
			<Content>
				<Title>{ orderItem.title }</Title>
				<span className='quantity'>X{ orderItem.quantity }{ orderItem?.selectedSize && ` | Size: ${orderItem.sizes.find(s => s.size === orderItem.selectedSize)?.size}`}</span>
			</Content>
		</Item>

	)
}

export default OrderItem