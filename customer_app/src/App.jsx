import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Outlet } from "react-router-dom"
import Header from "./components/Header"
import LocationSidebar from "./components/Sidebar/LocationSidebar"
import OrderSidebar from './components/Sidebar/OrderSidebar'
import ScrollToTop from "./components/ScrollToTop"
import LoginSidebar from "./components/Sidebar/LoginSidebar"
import useRestaurants from './hooks/useRestaurants'
import useAskForPwa from './hooks/useAskForPwa'
import { Toaster } from "react-hot-toast"
import { HelmetProvider } from 'react-helmet-async'

import { trackingReset } from './rtk/slices/trackingSlice'

const App = () => {
  useRestaurants()
  const { askForPwa } = useAskForPwa()
  const dispatch = useDispatch()
  const restaurants = useSelector(state => state.restaurants)
  const user = useSelector(state => state.user)
  const helmetContext = {}

  useEffect(() => {
    if (!user?.trackedOrder?.id) {
      dispatch(trackingReset())
      document.body.classList.remove("overflow-hidden")
    }
  }, [user?.trackedOrder?.id])

  useEffect(() => {
    askForPwa()
  }, [])
  
  return (
    <HelmetProvider context={helmetContext}>
      <Header />
      <Outlet />
      <LocationSidebar />
      <LoginSidebar />
      { user?.trackedOrder?.id && <OrderSidebar /> }
      <ScrollToTop />
      <Toaster toastOptions={{
          className: 'font-ProximaNovaSemiBold',
          position: 'top-center'
        }}
      />
    </HelmetProvider>
  )
}

export default App