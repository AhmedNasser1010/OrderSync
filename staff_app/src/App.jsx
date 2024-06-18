import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Routes, Route, useNavigate } from "react-router-dom"
import { increseRead, increseWrite } from './rtk/slices/apiUsageSlice'
import { addUser } from "./rtk/slices/userSlice.js"
import { setUserRegisterStatus } from './rtk/slices/conditionalValuesSlice'
import { initOrders } from './rtk/slices/ordersSlice'
import { initMenu } from './rtk/slices/menuSlice'
import styled from 'styled-components'
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase.js";

import LOGIN_IN_APP_STAR from './utils/LOGIN_IN_APP_STAR'
import DB_GET_DOC from './utils/DB_GET_DOC'
import AUTH_SIGNOUT from './utils/AUTH_SIGNOUT'

import Login from './Login'
import Signup from './Signup'
import NewUserComponent from './NewUserComponent'
import Navbar from './Navbar'
import Queue from './Queue'
import Settings from './Settings'
import Order from './Components/Order'

function App() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const userRegisterStatus = useSelector(state => state.conditionalValues.userRegisterStatus)
  const user = useSelector(state => state.user)

  useEffect(() => {
    LOGIN_IN_APP_STAR()
    .then(res => {
      if (res) {
        if (res.userInfo.role !== 'ORDER_CAPTAIN' || res.userInfo.role !== 'DELIVERY_CAPTAIN') {
          AUTH_SIGNOUT()
          navigate("/login")
          return
        }

        dispatch(addUser(res))
        dispatch(setUserRegisterStatus('LOGGED_IN'))
      } else {
        dispatch(setUserRegisterStatus('LOGGED_IN_NO_WORKER'))
      }
    })
    .catch(err => console.log(err))
  }, [])

  useEffect(() => {
    userRegisterStatus === 'LOGGED_OUT' && navigate('/login')
    userRegisterStatus === 'LOGGED_IN_NO_WORKER' && navigate('/')
    userRegisterStatus === 'LOGGED_IN' && navigate('/queue')
  }, [userRegisterStatus])

  useEffect(() => {
    let docRef = null
    if (user?.accessToken) docRef = doc(db, 'orders', user.accessToken)

    const unsub = user?.accessToken && onSnapshot(docRef, doc => {
      dispatch(initOrders(doc.data().open))
    })

    return () => {
      unsub && unsub()
    }
  }, [user])

  useEffect(() => {
    if (user?.accessToken) {
      DB_GET_DOC('menus', user.accessToken)
      .then(res => {
        dispatch(initMenu(res.items))
      })
      .catch(err => console.log(error))
    }
  }, [user])

  return (

    <>
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
              <Route path="/settings" element={<Settings />} />
            </>
        }
      </Routes>

      { userRegisterStatus === 'LOGGED_IN' && <Navbar /> }
    </>

  )
}

export default App
