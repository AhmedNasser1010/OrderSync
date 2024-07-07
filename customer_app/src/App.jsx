import { useSelector } from 'react-redux'
import { Outlet } from "react-router-dom"
import Header from "./components/Header"
import LocationSidebar from "./components/Sidebar/LocationSidebar"
import ScrollToTop from "./components/ScrollToTop"
import LoginSidebar from "./components/Sidebar/LoginSidebar"
import useRestaurants from './hooks/useRestaurants'

const App = () => {
  useRestaurants()
  const restaurants = useSelector(state => state.restaurants)

  return (
    <>
      <Header />
      <Outlet />
      <LocationSidebar />
      <LoginSidebar />
      <ScrollToTop />
    </>
  )
}

export default App