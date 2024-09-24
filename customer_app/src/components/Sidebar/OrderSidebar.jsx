import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import styled from 'styled-components'
import { doc, onSnapshot, collection, query, where } from "firebase/firestore"
import { IoIosCloseCircleOutline } from "react-icons/io"
import { IoSend } from "react-icons/io5"
import { GiCook } from "react-icons/gi"
import { MdDeliveryDining } from "react-icons/md"
import { useTranslation } from 'react-i18next'

import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import TimelineDot from '@mui/lab/TimelineDot'
import Typography from '@mui/material/Typography'

import { db } from '../../config/firebase'
import { toggleOrderSidebar } from "../../rtk/slices/toggleSlice"
import { initOrder, initDriver, initRes } from '../../rtk/slices/trackingSlice'
import useLanguageDirection from "../../hooks/useLanguageDirection"
import { restaurantMapIcon, driverMapIcon, personMapIcon } from './mapCustomMarker'
import DB_GET_DOC from '../../utils/DB_GET_DOC'
import DB_UPDATE_NESTED_VALUE from '../../utils/DB_UPDATE_NESTED_VALUE'
import DB_DELETE_NESTED_VALUE from '../../utils/DB_DELETE_NESTED_VALUE'
import useOrder from '../../hooks/useOrder'

const MapContainerStyled = styled(MapContainer)`
	width: 100%;
	height: 400px;
	position: relative;
`

function OrderSidebar() {
	const dispatch = useDispatch()
	const direction = useLanguageDirection()
	const { t } = useTranslation()
	const user = useSelector(state => state.user)
	const isOrderSidebarOpen = useSelector(state => state.toggle.isOrderSidebarOpen)
	const restaurants = useSelector(state => state.restaurants)
	const currentRes = restaurants?.find(res => res.accessToken === user.trackedOrder.restaurant)
	const { cancelOrder, trackedOrderData } = useOrder()

	const handleCloseSidebar = () => {
		dispatch(toggleOrderSidebar())
		document.body.classList.remove("overflow-hidden")
	}

	return (
		<>
			<div
				className={`order-sidebar fixed top-0 ${direction === 'rtl' ? 'left-0' : 'right-0' } h-full overflow-y-scroll bg-white transition-all duration-500 z-20 px-5 py-5 w-full sm:py-10 flex flex-col sm:w-[500px] ${isOrderSidebarOpen ? (direction === 'rtl' ? "-translate-x-0" : "translate-x-0") : (direction === 'rtl' ? "-translate-x-full" : "translate-x-full")}`}
			>
				<button className="text-3xl mb-5" onMouseUp={handleCloseSidebar}>
					<IoIosCloseCircleOutline />
				</button>

				<h2 className='text-color-1 text-3xl font-ProximaNovaMed text-center mb-5'>{t('Order Tracking')}</h2>

				<div>
					<Timeline
						position="alternate"
						style={{ direction: 'ltr' }}
					>
						<TimelineItem>
							<TimelineSeparator>
								<TimelineConnector />
								<TimelineDot color="primary">
									<IoSend />
								</TimelineDot>
								<TimelineConnector />
							</TimelineSeparator>
							<TimelineContent sx={{ py: '12px', px: 2 }}>
								<Typography variant="h6" component="span" style={{ fontFamily: 'ProximaNova Condensed Med !important' }}>
									{t('Dispatched')}
								</Typography>
								<Typography style={{ fontFamily: 'ProximaNova Condensed Thin', lineHeight: '20px', color: 'gray' }} >{t('Successfully dispatched')}</Typography>
							</TimelineContent>
						</TimelineItem>
						<TimelineItem>
							<TimelineSeparator>
								<TimelineConnector />
								<TimelineDot color={ trackedOrderData?.status?.current === 'PREPARING' || trackedOrderData?.status?.current === 'DELIVERY' ? 'primary' : 'grey'}>
									<GiCook />
								</TimelineDot>
								<TimelineConnector />
							</TimelineSeparator>
							<TimelineContent sx={{ py: '12px', px: 2 }}>
								<Typography variant="h6" component="span" style={{ fontFamily: 'ProximaNova Condensed Med !important' }}>
									{t('Preparation')}
								</Typography>
								<Typography style={{ fontFamily: 'ProximaNova Condensed Thin', lineHeight: '20px', color: 'gray' }} >{t('Currently being prepared')}</Typography>
							</TimelineContent>
						</TimelineItem>
						<TimelineItem>
							<TimelineSeparator>
								<TimelineConnector />
								<TimelineDot color={trackedOrderData?.status?.current === 'DELIVERY' ? 'primary' : 'grey'}>
									<MdDeliveryDining />
								</TimelineDot>
								<TimelineConnector />
							</TimelineSeparator>
							<TimelineContent sx={{ py: '12px', px: 2 }}>
								<Typography variant="h6" component="span" style={{ fontFamily: 'ProximaNova Condensed Med !important' }}>
									{t('Delivery')}
								</Typography>
								<Typography style={{ fontFamily: 'ProximaNova Condensed Thin', lineHeight: '20px', color: 'gray' }} >{t('On its way to you')}</Typography>
							</TimelineContent>
						</TimelineItem>
					</Timeline>

					<MapContainerStyled
						center={user?.locations?.home?.latlng}
						zoom={18}
						scrollWheelZoom={true}
					>
						<TileLayer
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							attribution='&copy; <a href="https://ahmed-nasser.netlify.app/" target="_blank">Ahmed Nasser</a> OrderSync Systems'
						/>
						{
							currentRes?.business?.latlng &&
							<Marker position={currentRes?.business?.latlng} icon={restaurantMapIcon}>
								<Popup>
									{ currentRes?.business?.name || t('Restaurant') }
								</Popup>
							</Marker>
						}
						{
							trackedOrderData?.location?.latlng &&
							<Marker position={trackedOrderData?.location?.latlng} icon={personMapIcon}>
								<Popup>
									{t('You')}
								</Popup>
							</Marker>
						}
						{
							trackedOrderData?.delivery?.liveLocation && trackedOrderData?.delivery?.liveLocation[0] && trackedOrderData?.delivery?.liveLocation[1] &&
							<Marker position={trackedOrderData?.delivery?.liveLocation} icon={driverMapIcon}>
								<Popup>
									<div className='flex'>
										<span>{t('Driver')}:</span>
										<span>{t('Name')}: {trackedOrderData?.delivery?.name}</span>
										<span>{t('Phone')}: {trackedOrderData?.delivery?.phone}</span>
									</div>
								</Popup>
							</Marker>
						}
						{
							currentRes && !trackedOrderData?.delivery &&
							<Marker position={[currentRes?.business?.latlng[0] + 0.0008, currentRes?.business?.latlng[1] + 0.0008]} icon={driverMapIcon}>
								<Popup>
									<div className='flex'>
										<span>{t('Driver')}:</span>
										<span>{t('Name')}: {trackedOrderData?.delivery?.name}</span>
										<span>{t('Phone')}: {trackedOrderData?.delivery?.phone}</span>
									</div>
								</Popup>
							</Marker>
						}
						{
							currentRes?.business?.latlng && trackedOrderData?.delivery?.liveLocation && trackedOrderData?.delivery?.liveLocation[0] && trackedOrderData?.delivery?.liveLocation[1] &&
							<Polyline pathOptions={{ color: 'grey' }} positions={[currentRes?.business?.latlng, trackedOrderData?.delivery?.liveLocation]} />
						}
						{
							currentRes?.business?.latlng && !trackedOrderData?.delivery &&
							<Polyline positions={[currentRes?.business?.latlng, [currentRes?.business?.latlng[0] + 0.0008, currentRes?.business?.latlng[1] + 0.0008]]} />
						}
						{
							trackedOrderData?.location?.latlng && trackedOrderData?.delivery?.liveLocation && trackedOrderData?.delivery?.liveLocation[0] && trackedOrderData?.delivery?.liveLocation[1] &&
							<Polyline positions={[trackedOrderData?.location?.latlng, trackedOrderData?.delivery?.liveLocation]} />
						}
						{
							trackedOrderData?.location?.latlng && !trackedOrderData?.delivery &&
							<Polyline positions={[trackedOrderData?.location?.latlng, [currentRes?.business?.latlng[0] + 0.0008, currentRes?.business?.latlng[1] + 0.0008]]} />
						}
					</MapContainerStyled>

					<div className="flex relative mt-10 mb-10">
						{
							trackedOrderData?.status?.current === "RECEIVED" ?
							<>
								{/*<button onMouseUp={handleOrderEdit} className='w-full py-4 uppercase text-base text-white font-ProximaNovaSemiBold cursor-pointer bg-color-11'>{t('Edit Items')}</button>*/}
								<button onMouseUp={cancelOrder} className='w-full py-4 uppercase text-base text-white font-ProximaNovaSemiBold cursor-pointer bg-red-500'>{t('Order Cancel')}</button>	
							</>
							:
							<button className='w-full py-4 uppercase text-base text-white font-ProximaNovaSemiBold cursor-pointer bg-gray-500'>
								{t('Cancellations and modifications')}<br/>
								{ currentRes?.business?.contactNumbers && currentRes?.business?.contactNumbers[0].slice(2) }
							</button>
						}
					</div>
				</div>

			</div>

			<div
				className={`order-sidebar-overlay ${isOrderSidebarOpen ? "fixed" : "hidden"} z-10 top-0 left-0 right-0 bottom-0 bg-color-1 opacity-[0.7] overflow-hidden`}
				onMouseUp={handleCloseSidebar}
			></div>
		</>
	)
}

export default OrderSidebar
