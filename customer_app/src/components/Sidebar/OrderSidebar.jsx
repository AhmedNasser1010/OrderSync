import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { latLngBounds } from 'leaflet'
import styled from 'styled-components'
import { IoIosCloseCircleOutline } from 'react-icons/io'
import { IoSend, IoCheckmarkCircle, IoCheckmarkDone } from 'react-icons/io5'
import { GiCook } from 'react-icons/gi'
import { MdDeliveryDining } from 'react-icons/md'
import { useTranslation } from 'react-i18next'

import { toggleOrderSidebar } from '../../rtk/slices/toggleSlice'
import useLanguageDirection from '../../hooks/useLanguageDirection'
import { restaurantMapIcon, driverMapIcon, personMapIcon } from './mapCustomMarker'
import useOrder from '../../hooks/useOrder'
import { useDriverLocation } from '../../hooks/useDriverLocation'

const STEPS = [
  { key: 'placed', statuses: ['RECEIVED'], icon: IoSend, label: 'Placed', sublabel: 'Order placed successfully' },
  { key: 'confirmed', statuses: ['ACCEPTED'], icon: IoCheckmarkCircle, label: 'Confirmed', sublabel: 'Restaurant accepted' },
  { key: 'preparing', statuses: ['PREPARING'], icon: GiCook, label: 'Preparing', sublabel: 'Being prepared' },
  { key: 'ontheway', statuses: ['READY', 'RESERVED', 'PICKED_UP', 'ON_ROUTE'], icon: MdDeliveryDining, label: 'On the Way', sublabel: 'On its way to you' },
  { key: 'delivered', statuses: ['DELIVERED', 'GIVEN_FEEDBACK'], icon: IoCheckmarkDone, label: 'Delivered', sublabel: 'Arrived at your door' },
]

const ERROR_STATUSES = ['CANCELED', 'REJECTED', 'VOIDED']

const MapContainerStyled = styled(MapContainer)`
  width: 100%;
  height: 400px;
  position: relative;
`

function FitMapToMarkers({ points }) {
  const map = useMap()

  useEffect(() => {
    const validPoints = points?.filter(
      (point) =>
        Array.isArray(point) &&
        point[0] !== null &&
        point[0] !== undefined &&
        point[1] !== null &&
        point[1] !== undefined
    )

    if (!validPoints?.length) return
    if (validPoints.length === 1) {
      map.setView(validPoints[0], 15, { animate: true })
      return
    }

    map.fitBounds(latLngBounds(validPoints), {
      padding: [40, 40],
      maxZoom: 15,
      animate: true
    })
  }, [map, points])

  return null
}

function StepIndicator({ step, index, currentStepIndex, totalSteps }) {
  const { t } = useTranslation()
  const isCompleted = index < currentStepIndex
  const isActive = index === currentStepIndex
  const isPending = index > currentStepIndex
  const isLast = index === totalSteps - 1

  return (
    <div className="flex items-stretch gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`
            relative flex items-center justify-center rounded-full transition-all duration-500
            ${isCompleted ? 'w-7 h-7 bg-color-11' : ''}
            ${isActive ? 'w-8 h-8 bg-color-2 order-pulse' : ''}
            ${isPending ? 'w-7 h-7 border-2 border-color-7 bg-white' : ''}
          `}
        >
          {isCompleted && <IoCheckmarkDone className="text-white text-sm" />}
          {isActive && <step.icon className="text-white text-sm" />}
          {isPending && <step.icon className="text-color-7 text-xs" />}
        </div>
        {!isLast && (
          <div
            className={`
              w-0.5 flex-1 min-h-[32px] transition-all duration-500
              ${isCompleted ? 'bg-color-11' : ''}
              ${isActive ? 'bg-gradient-to-b from-color-2 to-color-7' : ''}
              ${isPending ? 'bg-color-7 opacity-40' : ''}
            `}
          />
        )}
      </div>

      <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
        <p
          className={`
            text-sm leading-tight transition-all duration-300
            ${isCompleted ? 'text-color-1 font-ProximaNovaSemiBold' : ''}
            ${isActive ? 'text-color-2 font-ProximaNovaBold text-base' : ''}
            ${isPending ? 'text-color-5 font-ProximaNovaMed' : ''}
          `}
        >
          {t(step.label)}
        </p>
        {(isCompleted || isActive) && (
          <p className="text-xs text-color-5 font-ProximaNovaThin mt-0.5 leading-tight">
            {t(step.sublabel)}
          </p>
        )}
      </div>
    </div>
  )
}

function ErrorBanner({ status, reason, t }) {
  const labels = {
    CANCELED: 'Order Canceled',
    REJECTED: 'Order Rejected',
    VOIDED: 'Order Voided'
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
      <p className="text-red-600 font-ProximaNovaSemiBold text-sm">
        {t(labels[status] || 'Order Ended')}
      </p>
      {reason && (
        <p className="text-red-400 font-ProximaNovaThin text-xs mt-1">
          {t(reason)}
        </p>
      )}
    </div>
  )
}

function OrderSidebar() {
  const dispatch = useDispatch()
  const direction = useLanguageDirection()
  const { t } = useTranslation()
  const user = useSelector((state) => state.user)
  const isOrderSidebarOpen = useSelector((state) => state.toggle.isOrderSidebarOpen)
  const restaurants = useSelector((state) => state.restaurants)
  const currentRes = restaurants?.find((res) => res.accessToken === user.trackedOrder.restaurant)
  const { cancelOrder, trackedOrderData } = useOrder()
  const defaultCenter = [29.620106778124843, 31.255811811669496]
  const liveLocation = useDriverLocation(
    trackedOrderData?.assignment?.driverUid,
    trackedOrderData?.status?.current
  )
  const driverLocation = liveLocation ? [liveLocation.lat, liveLocation.lng] : null
  const mapPoints = [
    currentRes?.profile?.latlng,
    trackedOrderData?.delivery?.latlng,
    driverLocation
  ]

  const currentStatus = trackedOrderData?.status?.current

  const currentStepIndex = useMemo(() => {
    if (!currentStatus) return 0
    const idx = STEPS.findIndex((step) => step.statuses.includes(currentStatus))
    return idx >= 0 ? idx : 0
  }, [currentStatus])

  const isError = ERROR_STATUSES.includes(currentStatus)
  const isMapLive = ['READY', 'RESERVED', 'PICKED_UP', 'ON_ROUTE'].includes(currentStatus)

  const handleCloseSidebar = () => {
    dispatch(toggleOrderSidebar())
    document.body.classList.remove('overflow-hidden')
  }

  return (
    <>
      <div
        className={`order-sidebar fixed top-0 ${direction === 'rtl' ? 'left-0' : 'right-0'} h-full overflow-y-scroll bg-white transition-all duration-500 z-20 px-5 py-5 w-full sm:py-10 flex flex-col sm:w-[500px] ${isOrderSidebarOpen ? (direction === 'rtl' ? '-translate-x-0' : 'translate-x-0') : direction === 'rtl' ? '-translate-x-full' : 'translate-x-full'}`}>
        <button className="text-3xl mb-5" onMouseUp={handleCloseSidebar}>
          <IoIosCloseCircleOutline />
        </button>

        <h2 className="text-color-1 text-3xl font-ProximaNovaMed text-center mb-5">
          {t('Order Tracking')}
        </h2>

        {isError && trackedOrderData && (
          <ErrorBanner
            status={currentStatus}
            reason={trackedOrderData?.status?.cancellationReason}
            t={t}
          />
        )}

        {!isError && (
          <div className="mb-5 px-1">
            {STEPS.map((step, index) => (
              <StepIndicator
                key={step.key}
                step={step}
                index={index}
                currentStepIndex={currentStepIndex}
                totalSteps={STEPS.length}
              />
            ))}
          </div>
        )}

        <div className="relative mb-4">
          <MapContainerStyled
            center={user?.locations?.home?.latlng || defaultCenter}
            zoom={13}
            scrollWheelZoom={isMapLive}
            className={!isMapLive ? 'blur-sm pointer-events-none' : ''}>
            <FitMapToMarkers points={mapPoints} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://ahmed-nasser.netlify.app/" target="_blank">Ahmed Nasser</a> OrderSync Systems'
            />
            {currentRes?.profile?.latlng && (
              <Marker position={currentRes?.profile?.latlng} icon={restaurantMapIcon}>
                <Popup>{currentRes?.profile?.name || t('Restaurant')}</Popup>
              </Marker>
            )}
            {trackedOrderData?.delivery?.latlng && (
              <Marker position={trackedOrderData?.delivery?.latlng} icon={personMapIcon}>
                <Popup>{t('You')}</Popup>
              </Marker>
            )}
            {driverLocation && (
              <Marker position={driverLocation} icon={driverMapIcon}>
                <Popup>{t('Driver')}</Popup>
              </Marker>
            )}
            {currentRes?.profile?.latlng && driverLocation && (
              <Polyline
                pathOptions={{ color: 'grey' }}
                positions={[
                  currentRes?.profile?.latlng,
                  driverLocation
                ]}
              />
            )}
            {trackedOrderData?.delivery?.latlng && driverLocation && (
              <Polyline
                positions={[
                  trackedOrderData?.delivery?.latlng,
                  driverLocation
                ]}
              />
            )}
          </MapContainerStyled>
          {!isMapLive && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-md">
                <p className="text-color-1 font-ProximaNovaSemiBold text-sm text-center">
                  {t('Live tracking available soon')}
                </p>
                <p className="text-color-5 font-ProximaNovaThin text-xs text-center mt-0.5">
                  {t("You'll see your driver in real time")}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex relative mt-10 mb-10">
          {currentStatus === 'RECEIVED' ? (
            <>
              <button
                onMouseUp={cancelOrder}
                className="w-full py-4 uppercase text-base text-white font-ProximaNovaSemiBold cursor-pointer bg-red-500 rounded-xl">
                {t('Order Cancel')}
              </button>
            </>
          ) : (
            <button className="w-full py-4 uppercase text-base text-white font-ProximaNovaSemiBold cursor-pointer bg-color-5 rounded-xl">
              {t('Cancellations and modifications')}
              <br />
              {currentRes?.business?.contactNumbers &&
                currentRes?.business?.contactNumbers[0].slice(2)}
            </button>
          )}
        </div>
      </div>

      <div
        className={`order-sidebar-overlay ${isOrderSidebarOpen ? 'fixed' : 'hidden'} z-10 top-0 left-0 right-0 bottom-0 bg-color-1 opacity-[0.7] overflow-hidden`}
        onMouseUp={handleCloseSidebar}></div>
    </>
  )
}

export default OrderSidebar
