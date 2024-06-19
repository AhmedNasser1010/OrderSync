import './App.css'
import './styles/splideArrows.css'

import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Routes, Route, useNavigate } from "react-router-dom";
import { setMenu } from './rtk/slices/menuSlice'
import { initBusinessInfo } from './rtk/slices/businessInfoSlice'

import Navbar from './Navbar'
import Cart from './Cart'
import Home from './Home'
import Checkout from './Checkout'

const API_URL = 'https://ordersync-demo.onrender.com/api/'
const X_SECRET_KEY = '4d10754c-0a04-492c-9f41-df7ed0ca580e'

function App() {
  const dispatch = useDispatch()
  const menu = useSelector(state => state.menu)
  const businessInfo = useSelector(state => state.businessInfo)

  useEffect(() => {

    const myHeaders = new Headers();
    myHeaders.append("x-secret-key", X_SECRET_KEY)

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    if (menu.items.length === 0 || menu.categories.length === 0 ) {
    fetch(`${API_URL}menu`, requestOptions)
      .then(res => res.json())
      .then(result => dispatch(setMenu(result)))
      .catch(error => console.error(error))  
    }
  }, [])

  useEffect(() => {
    const myHeaders = new Headers()
    myHeaders.append("x-secret-key", X_SECRET_KEY)

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    }

    !businessInfo.hasOwnProperty() && fetch(`${API_URL}business`, requestOptions)
      .then(response => response.json())
      .then(result => dispatch(initBusinessInfo(result)))
      .catch(error => console.error(error))
  }, [])

  return (
    <>
      <Navbar />
      <Cart />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </>
  )
}

export default App
