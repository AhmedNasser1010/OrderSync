import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'


import SectionTitle from './SectionTitle'
import MenuCard from './MenuCard'
import PlaceOrderWindow from './PlaceOrderWindow'

const Container = styled.section`
	padding: 0 250px;
`

const CardsContainer = styled.div`
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	gap: 2.5rem;
	margin-top: 30px;
`

function MenuItems() {
	const [isOpen, setIsOpen] = useState(false)
	const [currentPlaceOrderId, setCurrentPlaceOrderId] = useState(null)
	const menuItems = useSelector(state => state.menu.items)
	const [cardsData, setCardsData] = useState([])

	const toggleWindow = (id) => {
		setIsOpen(!isOpen)
		setCurrentPlaceOrderId(id || null)
	}

	useEffect(() => {
		const result = menuItems?.map(item => (
				{
					id: item.id,
					title: item.title,
					perviewImage: item.backgrounds[0],
					rating: item.rating,
					category: item.category,
					price: item.price,
					discount: item.discount
				}
			)) || []
		setCardsData(result)
	}, [menuItems])

	return (

		<Container>
			<SectionTitle style={{ textAlign: 'center' }}>Menu Items</SectionTitle>

			<CardsContainer>
				{cardsData.map(card => <MenuCard key={card.id} data={card} style={{ width: '40%' }} onMouseUp={() => toggleWindow(card.id)} />)}
			</CardsContainer>

			<PlaceOrderWindow
				id={currentPlaceOrderId}
				toggleWindow={toggleWindow}
				visibileCondition={isOpen}
			/>

		</Container>

	)
}

export default MenuItems