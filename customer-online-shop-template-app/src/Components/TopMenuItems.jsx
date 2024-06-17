import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import { useSelector } from 'react-redux'

import SectionTitle from './SectionTitle'
import MenuCard from './MenuCard'
import PlaceOrderWindow from './PlaceOrderWindow'

const Container = styled.section`
	padding: 0 120px;
`

const Slide = styled.div`
	margin-top: 30px;
`

function TopMenuItems() {
	const [isOpen, setIsOpen] = useState(false)
	const [currentPlaceOrderId, setCurrentPlaceOrderId] = useState(null)
	const menuItems = useSelector(state => state.menu.items)
	const [cardsData, setCardsData] = useState([])
	const splideRef = useRef(null)

	const splideOptions = {
		type: 'loop',
		perPage: 3,
		perMove: 1,
		autoplay: true,
		interval: 3000,
		pagination: false,
		arrows: true,
		gap: '2.5rem',
	}

	const toggleWindow = (id) => {
		setIsOpen(!isOpen)
	}

	useEffect(() => {
		const splide = splideRef.current.splide

		const handleClick = (e) => {
			const id = e.slide.attributes.slideid.value
			setIsOpen(!isOpen)
			setCurrentPlaceOrderId(id || null)
		}

		splide && splide.on('click', handleClick)

		return () => splide && splide.off('click', handleClick)
	}, [splideRef])

	useEffect(() => {
		const result = menuItems
			?.filter(item => item.topMenu)
			.map(item => (
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
			<SectionTitle>Top Menu Items!</SectionTitle>

			<Slide>
				<Splide
					ref={splideRef}
					aria-label="Top Menu Items! Slider" 
					options={splideOptions}
				>
					{cardsData.map(card => (

						<SplideSlide key={card.id} slideid={card.id}>
							<MenuCard data={card} />
						</SplideSlide>

					))}
				</Splide>
			</Slide>

			<PlaceOrderWindow
				id={currentPlaceOrderId}
				toggleWindow={toggleWindow}
				visibileCondition={isOpen}
			/>

		</Container>

	)
}

export default TopMenuItems