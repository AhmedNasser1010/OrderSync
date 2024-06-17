import { useState, useEffect } from 'react'
import styled from 'styled-components'

const Item = styled.div`
	display: flex;
	gap: 1rem;
	align-items: center;
	justify-content: space-between;
`
const Image = styled.img`
	width: 120px;
	border-radius: 30px;
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

function OrderItem({ orderItem }) {
	return (

		<Item>
			<Image src={orderItem.backgrounds[0]} alt="item image" />
			<Content>
				<h4>{ orderItem.title }</h4>
				<span className='quantity'>X{ orderItem.quantity }</span>
			</Content>
		</Item>

	)
}

export default OrderItem