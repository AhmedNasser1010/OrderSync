import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { toast } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { addToUserLocation } from '../rtk/slices/checkoutSlice'

import LocationButton from './LocationButton'
import AddMarker from './AddMarker'
import CheckoutMainButton from './CheckoutMainButton'
import Divider from './Divider'
import InputWrapper from './StyledInput/InputWrapper'
import CheckoutPageTitle from './CheckoutPageTitle'

const Container = styled.div``
const MapContainerStyled = styled(MapContainer)`
	margin-bottom: 50px;
	z-index: 0;
	width: 100%;
	height: 500px;
	position: relative;
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

function CheckoutUserAddress({ handleCurrentState }) {
	const dispatch = useDispatch()
	const [newCustomMark, setNewCustomMark] = useState(null)
	const [userCurrentLocation, setUserCurrentLocation] = useState(null)
	const [address, setAddress] = useState('')
	const [markers, setMarkers] = useState([
		{latlng: [29.620724, 31.250945], popup: 'Restaurant Location'}
	])
	const [selectedLocation, setSelectedLocation] = useState('current') 
	const checkout = useSelector(state => state.checkout)

	const addMarker = (mark) => {
		setNewCustomMark(mark.latlng)
		const clearMarkers = markers.filter(mark => !mark.byUser)
		setMarkers(clearMarkers)
		setMarkers((current) => [...current, mark])
	}

	const handleSetUserCurrentLocation = (latlng) => {
		setUserCurrentLocation(latlng)
	}

	const handleOnRadioChange = (e) => {
		!newCustomMark && toast.error("Select Your Custom Location First")
		newCustomMark && setSelectedLocation(e.target.value)
	}

	const handleAddressChange = (e) => {
		setAddress(e.target.value)
	}

	const handleToNext = () => {
		const errorMsg = 'You must have one or more of this three options, use find my location, or add your custom location, or use the reqular address option'
		if (newCustomMark || address || userCurrentLocation) {
			handleCurrentState('ON_PAYMENT')
		} else {
			return errorMsg
		}
	}

	useEffect(() => {
		dispatch(addToUserLocation({
			positions: {
				current: [userCurrentLocation?.lat, userCurrentLocation?.lng],
				custom: [newCustomMark?.lat, newCustomMark?.lng],
				selected: selectedLocation
			},
			address: address
		}))
	}, [userCurrentLocation, newCustomMark, selectedLocation, address])


	return (

		<Container>
			<CheckoutPageTitle title='Address & Location' />
			<MapContainerStyled
				center={markers[0].latlng}
				zoom={18}
				scrollWheelZoom={true}
			>
				<TileLayer
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					attribution='&copy; <a href="https://ahmed-nasser.netlify.app/" target="_blank">Ahmed Nasser</a> OrderSync Systems'
				/>
				{
					markers.map((mark, idx) => (
						<Marker key={idx} position={mark.latlng}>
							<Popup>
								{ mark.popup }
							</Popup>
						</Marker>
					))
				}
				<LocationButton handleSetUserCurrentLocation={handleSetUserCurrentLocation} />
				<AddMarker addMarker={addMarker} />
			</MapContainerStyled>
			<RadioFormWrapper>
				<RadioInputWrapper htmlFor='current-location' style={{ borderColor: selectedLocation === 'current' && 'blue' }}>
					<Radio
						id='current-location'
						type='radio'
						name='location'
						value='current'
						checked={selectedLocation === 'current'}
						onChange={handleOnRadioChange}
					/>
					<RadioTitle>Current Location</RadioTitle>
					<RadioInputP>
						The order will be delivered to your current location
					</RadioInputP>
				</RadioInputWrapper>
				<RadioInputWrapper htmlFor='new-selected-location' style={{ borderColor: selectedLocation === 'custom' && 'blue' }}>
					<Radio
						id='new-selected-location'
						type='radio'
						name='location'
						value='custom'
						checked={selectedLocation === 'custom' && newCustomMark}
						onChange={handleOnRadioChange}
					/>
					<RadioTitle>New Selected Location</RadioTitle>
					<RadioInputP>
						The order will be delivered to your new selected location
					</RadioInputP>
				</RadioInputWrapper>
			</RadioFormWrapper>
			<Divider />
			<InputWrapper
				id='address'
				type="text"
				label='Address'
				placeholder='A street, village, or well-known place'
				value={address}
				onChange={handleAddressChange}
			/>
			<Divider />
			<CheckoutMainButton
				nextLabel='Payment'
				backLabel='Back To User Info'
				nextEventCallback={handleToNext}
				backEventCallback={() => handleCurrentState('ON_USER_INFO')}
			/>
		</Container>

	)
}

export default CheckoutUserAddress