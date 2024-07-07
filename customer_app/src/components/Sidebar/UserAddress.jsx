import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import Control from 'react-leaflet-custom-control'
import 'leaflet/dist/leaflet.css'
import { useDispatch, useSelector } from 'react-redux'
import { initUser } from '../../rtk/slices/userSlice'
import toast, { Toaster } from "react-hot-toast"
import { toggleLoginSidebar } from '../../rtk/slices/toggleSlice'
import { useTranslation } from 'react-i18next'

import DB_ADD_DOC from '../../utils/DB_ADD_DOC'

import LocationButton from './LocationButton'
import AddMarker from './AddMarker'
import Divider from './Divider'

const Container = styled.div``
const MapContainerStyled = styled(MapContainer)`
	z-index: 0;
	width: 100%;
	height: 400px;
	position: relative;
`

function UserAddress({ setExpandUserAddress }) {
	const { t } = useTranslation()
	const dispatch = useDispatch()
	const user = useSelector(state => state.user)
	const [address, setAddress] = useState(user?.locations?.home?.address || '')
	const homeLatlng = user?.locations?.home?.latlng[0] ? user?.locations?.home?.latlng : [29.620106778124843, 31.255811811669496]
	const [markers, setMarkers] = useState([])

	const addMarker = (mark) => {
		const clearMarkers = markers.filter(mark => !mark.byUser)
		setMarkers(clearMarkers)
		setMarkers((current) => [...current, {latlng: mark, popup: 'Home location', byUser: true}])
	}

	const handleAddressChange = (e) => {
		setAddress(e.target.value)
	}

	const onSubmit = () => {
		const notSameLatlng = markers[0]?.latlng[0] && markers[0]?.latlng[0] !== user?.locations?.home?.latlng[0] && markers[0]?.latlng[1] !== user?.locations?.home?.latlng[1]
		const notDefaultLatlng = markers[0]?.latlng[0] !== 29.620106778124843 && markers[0]?.latlng[1] !== 31.255811811669496
		const notSameAddress = address !== user?.locations?.home?.address

		if ((notSameLatlng && notDefaultLatlng) || notSameAddress) {

			const userWithNewData = {
			  ...user,
			  locations: {
			  	...user.locations,
			    home: {
			      latlng: [Number(markers[0]?.latlng[0]), Number(markers[0]?.latlng[1])],
			    	address: address,
			    },
			  },
			}

			toast.promise(
				DB_ADD_DOC('customers', user?.userInfo?.uid, userWithNewData)
				.then(res => {
					if (res) {
						dispatch(initUser(userWithNewData))
						dispatch(toggleLoginSidebar())
						document.body.classList.remove("overflow-hidden")
						return res
					}
					console.log('wrong')
					return res
				}),
				{
					loading: t('Saving...'),
					success: t('Success.'),
					error: t('Could not save your settings.'),
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
	}

	return (

		<Container>
		<Toaster />
			<MapContainerStyled
				center={[29.620106778124843, 31.255811811669496]}
				zoom={18}
				scrollWheelZoom={true}
			>
				<TileLayer
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					attribution='&copy; <a href="https://ahmed-nasser.netlify.app/" target="_blank">Ahmed Nasser</a> OrderSync Systems'
				/>
				{
					markers?.map((mark, idx) => (
						<Marker key={idx} position={mark?.latlng}>
							<Popup>
								{ mark.popup }
							</Popup>
						</Marker>
					))
				}
				<AddMarker addMarker={addMarker} />
				<Control position='topright'>
					<LocationButton addMarker={addMarker} />
				</Control>
			</MapContainerStyled>
			<Divider style={{ margin: '20px 0' }} />
			<input
				className={`w-full p-5 border border-gray-300 mb-5 ${!address && 'error'}`}
				id='address'
				type="text"
				label={t('Address')}
				placeholder={t('Location Address')}
				value={address}
				onChange={handleAddressChange}
			/>
			<button
				onMouseUp={onSubmit}
				type='submit'
				className='w-full bg-color-2 py-4 uppercase text-base text-white font-ProximaNovaSemiBold cursor-pointer'
			>
				{t('Save')}
			</button>
		</Container>

	)
}

export default UserAddress