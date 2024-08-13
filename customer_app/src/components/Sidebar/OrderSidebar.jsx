import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import styled from 'styled-components'
import { doc, onSnapshot } from "firebase/firestore"
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
	const tracking = useSelector(state => state.tracking)
	const restaurants = useSelector(state => state.restaurants)
	const [driverId, setDriverId] = useState(tracking?.order?.assign?.driver || null)
	const [isAvailableToEdit, setIsAvailableToEdit] = useState(true)

	useEffect(() => {
		if (tracking.order) {
			setDriverId(tracking.order.assign.driver)
			if (tracking.order.status !== 'RECEIVED') {
				setIsAvailableToEdit(false)
			} else {
				setIsAvailableToEdit(true)
			}
		}
	}, [tracking])

	const handleCloseSidebar = () => {
		dispatch(toggleOrderSidebar())
		document.body.classList.remove("overflow-hidden")
	}

	useEffect(() => {
		let unsubOrder = null
		let unsubDriver = null

		if (user?.trackedOrder?.id) {

			const orderRef = doc(db, 'orders', user?.trackedOrder?.restaurant)

			unsubOrder = onSnapshot(orderRef, doc => {
				window.read += 1
				console.log('Read: ', window.read)

				if (doc.exists()) {
					const orders = doc.data()?.open || []

					const order = orders.find(order => order.user.uid === user.userInfo.uid && order.id === user.trackedOrder.id)

					if (!order) {
						handleOrderIsCanceledByRes()
						unsubOrder()
						return
					}

					if (order && order.status === 'COMPLETED') {
						dispatch(initOrder(order))
						handleOrderIsCompleted()
						unsubOrder()
						return
					}

					if (order) {
						dispatch(initOrder(order))
						handleOrderIsNotCompletedYet()
						return
					}
				}
			})

			if (driverId) {
				const driverRef = doc(db, 'drivers', driverId)

				unsubDriver = onSnapshot(driverRef, doc => {
					window.read += 1
					console.log('Read: ', window.read)

					if (doc.exists()) {
						const liveLocation = doc.data().liveLocation
						const name = doc.data().userInfo.name
						const phone = doc.data().userInfo.phone

						dispatch(initDriver({ liveLocation, name, phone }))
					}
				})
			}

		}


		return () => {
			unsubDriver && unsubDriver()
		}
	}, [isOrderSidebarOpen, driverId])

	const handleOrderCancel = async () => {
		try {
			const currentResOrders = await DB_GET_DOC('orders', tracking.res.accessToken)
			const ordersAfter = currentResOrders.open.filter(order => order.id !== tracking.order.id)

			DB_UPDATE_NESTED_VALUE('orders', tracking.res.accessToken, 'open', ordersAfter)
			.then(res => {
				if (res) {
					DB_DELETE_NESTED_VALUE('customers', user.userInfo.uid, 'trackedOrder')
				}
			})
		} catch(e) {
			console.log('Encountered error while order delete', e)
		}
	}

	const handleOrderIsNotCompletedYet = () => {
		// Update the related res to the order to get order res data if needed
		restaurants.map(res => {
			if (res?.accessToken === user?.trackedOrder?.restaurant) {
				dispatch(initRes(res))
				return
			}
		})
	}

	const handleOrderIsCompleted = () => {
		DB_DELETE_NESTED_VALUE('customers', user.userInfo.uid, 'trackedOrder')
	}

	const handleOrderIsCanceledByRes = () => {
		DB_DELETE_NESTED_VALUE('customers', user.userInfo.uid, 'trackedOrder')
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
								<TimelineDot color={ tracking?.order?.status === 'IN_PROGRESS' || tracking?.order?.status === 'IN_DELIVERY' ? 'primary' : 'grey'}>
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
								<TimelineDot color={tracking?.order?.status === 'IN_DELIVERY' ? 'primary' : 'grey'}>
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
							tracking?.res?.business?.latlng &&
							<Marker position={tracking?.res?.business?.latlng} icon={restaurantMapIcon}>
								<Popup>
									{ tracking?.res?.business?.name || t('Restaurant') }
								</Popup>
							</Marker>
						}
						{
							tracking?.order?.location?.latlng &&
							<Marker position={tracking?.order?.location?.latlng} icon={personMapIcon}>
								<Popup>
									{ user?.userInfo?.name || t('You') }
								</Popup>
							</Marker>
						}
						{
							tracking?.driver?.liveLocation && tracking?.driver?.liveLocation[0] && tracking?.driver?.liveLocation[1] &&
							<Marker position={tracking?.driver?.liveLocation} icon={driverMapIcon}>
								<Popup>
									<div className='flex'>
										<span>{t('Driver')}:</span>
										<span>{t('Name')}: {tracking?.driver?.name}</span>
										<span>{t('Phone')}: {tracking?.driver?.phone}</span>
									</div>
								</Popup>
							</Marker>
						}
						{
							tracking?.res && !tracking?.driver &&
							<Marker position={[tracking?.res?.business?.latlng[0] + 0.0008, tracking?.res?.business?.latlng[1] + 0.0008]} icon={driverMapIcon}>
								<Popup>
									<div className='flex'>
										<span>{t('Driver')}:</span>
										<span>{t('Name')}: {tracking?.driver?.name}</span>
										<span>{t('Phone')}: {tracking?.driver?.phone}</span>
									</div>
								</Popup>
							</Marker>
						}
						{
							tracking?.res?.business?.latlng && tracking?.driver?.liveLocation && tracking?.driver?.liveLocation[0] && tracking?.driver?.liveLocation[1] &&
							<Polyline pathOptions={{ color: 'grey' }} positions={[tracking?.res?.business?.latlng, tracking?.driver?.liveLocation]} />
						}
						{
							tracking?.res?.business?.latlng && !tracking?.driver &&
							<Polyline positions={[tracking?.res?.business?.latlng, [tracking?.res?.business?.latlng[0] + 0.0008, tracking?.res?.business?.latlng[1] + 0.0008]]} />
						}
						{
							tracking?.order?.location?.latlng && tracking?.driver?.liveLocation && tracking?.driver?.liveLocation[0] && tracking?.driver?.liveLocation[1] &&
							<Polyline positions={[tracking?.order?.location?.latlng, tracking?.driver?.liveLocation]} />
						}
						{
							tracking?.order?.location?.latlng && !tracking?.driver &&
							<Polyline positions={[tracking?.order?.location?.latlng, [tracking?.res?.business?.latlng[0] + 0.0008, tracking?.res?.business?.latlng[1] + 0.0008]]} />
						}
					</MapContainerStyled>

					<div className="flex relative mt-10 mb-10">
						{
							isAvailableToEdit ?
							<>
								{/*<button onMouseUp={handleOrderEdit} className='w-full py-4 uppercase text-base text-white font-ProximaNovaSemiBold cursor-pointer bg-color-11'>{t('Edit Items')}</button>*/}
								<button onMouseUp={handleOrderCancel} className='w-full py-4 uppercase text-base text-white font-ProximaNovaSemiBold cursor-pointer bg-red-500'>{t('Order Cancel')}</button>	
							</>
							:
							<button className='w-full py-4 uppercase text-base text-white font-ProximaNovaSemiBold cursor-pointer bg-gray-500'>
								{t('Cancellations and modifications')}<br/>
								{ tracking?.res?.business?.contactNumbers && tracking.res.business.contactNumbers[0].slice(2) }
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
