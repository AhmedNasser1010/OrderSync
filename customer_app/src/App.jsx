import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Outlet } from "react-router-dom"
import Header from "./components/Header"
import LocationSidebar from "./components/Sidebar/LocationSidebar"
import OrderSidebar from './components/Sidebar/OrderSidebar'
import ScrollToTop from "./components/ScrollToTop"
import LoginSidebar from "./components/Sidebar/LoginSidebar"
import useRestaurants from './hooks/useRestaurants'
import useOrder from './hooks/useOrder'
import { Toaster } from "react-hot-toast"
import { HelmetProvider } from 'react-helmet-async'
import AskForPwa from './components/AskForPwa'
import PopupProvider from './PopupProvider'

const App = () => {
  useRestaurants()
  useOrder()
  const user = useSelector(state => state.user)
  
  return (
    <HelmetProvider context={{}}>
      <PopupProvider>
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
        <AskForPwa />
      </PopupProvider>
    </HelmetProvider>
  )
}

export default App