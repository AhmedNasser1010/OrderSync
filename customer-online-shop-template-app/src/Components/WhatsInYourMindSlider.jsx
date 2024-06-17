import { useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import '@splidejs/splide/dist/css/splide.min.css'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import styled from 'styled-components'

import SectionTitle from './SectionTitle'

const Container = styled.section`
  padding: 0 120px;
  margin-bottom: 50px;
`

function WhatsInYourMindSlider() {
	const categories = useSelector(state => state.menu?.categories)
	const splideRef = useRef(null)


	const splideOptions = {
		type: 'loop',
		perPage: 6,
		perMove: 2,
		autoplay: true,
		interval: 2000,
		pagination: false,
		arrows: true,
		gap: '2.5rem',
	}

	useEffect(() => {
		const splide = splideRef.current.splide

		const handleClick = (e) => {
			const id = e.slide.attributes.slideid.value
			console.log(id)
		}

		splide && splide.on('click', handleClick)

		return () => splide && splide.off('click', handleClick)
	}, [splideRef])

	return (

		<Container>
			<SectionTitle>What's on your mind?</SectionTitle>
			
			<Splide
				ref={splideRef}
				aria-label="What's on your mind? Slider"
				options={splideOptions}
			>
				{
					categories?.map((category, i) => (
						<SplideSlide key={category.backgrounds[0]} slideid={category.id}>
							<img
								src={category.backgrounds[0]}
								alt={`Image ${i+1}`}
								style={{ width: '100%' }}
							/>
						</SplideSlide>
					))
				}
			</Splide>
		</Container>

	)
}

export default WhatsInYourMindSlider