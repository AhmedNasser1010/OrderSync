import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Routes, Route, useNavigate } from "react-router-dom"
import { increseRead, increseWrite } from './rtk/slices/apiUsageSlice'
import { addUser } from "./rtk/slices/userSlice.js"
import { setUserRegisterStatus } from './rtk/slices/conditionalValuesSlice'
import { initOrders } from './rtk/slices/ordersSlice'
import { initQueue } from './rtk/slices/queueSlice'
import { initPartnerServices } from './rtk/slices/partnerServicesSlice'
import { initBusiness } from './rtk/slices/businessSlice'
import styled from 'styled-components'
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "./firebase.js";
import { Toaster } from 'react-hot-toast'


import LOGIN_IN_APP_STAR from './utils/LOGIN_IN_APP_STAR'
import DB_GET_DOC from './utils/DB_GET_DOC'
import DB_DOC_SUBSCRIBE from './utils/DB_DOC_SUBSCRIBE'
import AUTH_SIGNOUT from './utils/AUTH_SIGNOUT'
import useDriverTracking from './hooks/useDriverTracking'

import Header from './Header'
import Login from './Login'
import Signup from './Signup'
import NewUserComponent from './NewUserComponent'
import Navbar from './Navbar'
import Queue from './Queue'
import OrderQRScan from './OrderQRScan'
import Settings from './Settings'
import Order from './Components/Order'

import useAutoRegister from './hooks/useAutoRegister'
import useMenus from './hooks/useMenus'

function App() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const autoRegister = useAutoRegister()
  const menus = useMenus()
  const { driverTracking, clearTracking } = useDriverTracking()
  const userRegisterStatus = useSelector(state => state.conditionalValues.userRegisterStatus)
  const user = useSelector(state => state.user)
  const business = useSelector(state => state.business)
  const [userIsFounded, setUserIsFounded] = useState(false)
  const queue = useSelector(state => state.queue)

  // Auto login and get user data
  useEffect(() => {
    autoRegister()
  }, [])

  // Set the `userIsFounded` to true when the user data is founded once
  useEffect(() => {
    if (user?.uid) {
      !userIsFounded && setUserIsFounded(true)
    }
  }, [user])

  // Navigate depending on current login status
  useEffect(() => {
    userRegisterStatus === 'LOGGED_OUT' && navigate('/login')
    userRegisterStatus === 'LOGGED_IN_NO_WORKER' && navigate('/')
    userRegisterStatus === 'LOGGED_IN' && navigate('/queue')
  }, [userRegisterStatus])

  // User document subscribe
  useEffect(() => {
    if (user?.uid) {

      DB_GET_DOC('users', user?.partnerUid)
      .then(partner => {
        dispatch(initPartnerServices(partner.services))
      })

      const docRef = doc(db, 'drivers', user.uid)

      onSnapshot(docRef, doc => {
        window.read += 1
        console.log('User document Read: ', window.read)
        if (doc.exists()) {
          dispatch(addUser(doc.data()))
        }
      })
    }
  }, [userIsFounded])

  // Orders document subscribe
  useEffect(() => {
    if (user?.accessToken) {

      const docRef = collection(db, "orders", user.accessToken, "openQueue");

      const q = query(docRef, where("delivery.uid", "==", user.uid));

      onSnapshot(q, (querySnapshot) => {
        window.read += querySnapshot.size;
        console.log("Orders documents read: ", window.read);

        if (!querySnapshot.empty) {
          const ordersQueue = [];
          querySnapshot.forEach((doc) => {
            ordersQueue.push(doc.data());
          });
          dispatch(initQueue(ordersQueue));
          return
        }

        dispatch(initQueue([]));
      });
    }
  }, [userIsFounded, user?.accessToken])
  
  // Trigger user location tracking update
  useEffect(() => {
    clearTracking()
    driverTracking()

    return () => {
      clearTracking()
    }
  }, [user])

  // Get menus data
  useEffect(() => {
    menus()
  }, [queue])

  return (

    <>
      { userRegisterStatus === 'LOGGED_IN' && <Header /> }
      <Routes>
        {
          userRegisterStatus === 'LOGGED_OUT' &&
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </>
        }
        {
          userRegisterStatus === 'LOGGED_IN_NO_WORKER' &&
            <>
              <Route path="/" element={<NewUserComponent />} />
            </>
        }
        {
          userRegisterStatus === 'LOGGED_IN' &&
            <>
              <Route path="/queue" element={<Queue />} />
              <Route path="/queue/:id" element={<Order />} />
              <Route path="/order-qrscan" element={<OrderQRScan />} />
              <Route path="/settings" element={<Settings />} />
            </>
        }
      </Routes>

      { userRegisterStatus === 'LOGGED_IN' && <Navbar /> }

      <Toaster
        position="top-center"
        reverseOrder={false}
      />
    </>

  )
}

export default App
