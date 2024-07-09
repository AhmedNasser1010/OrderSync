import "./style/Normaliz.css"
import "./style/all.css"

import { useEffect } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from 'react-redux'
import { setUserRegisterStatus, setIsGetAppData } from './rtk/slices/conditionalValuesSlice'
import { addUser } from './rtk/slices/userSlice'
import { initStaff } from './rtk/slices/staffSlice'
import { addMenu } from './rtk/slices/menuSlice'
import { initBusiness } from './rtk/slices/businessSlice'
import { setOpenedOrders } from './rtk/slices/ordersSlice'
import fetchStaff from './functions/fetchStaff'
import DB_GET_DOC from './functions/DB_GET_DOC'
import AUTH_ON_CHANGE from './functions/AUTH_ON_CHANGE'
import AUTH_signout from './functions/AUTH_signout'

// Components
import SideBar from "./Component/SideBar.jsx"

// Pages
import Home from "./Home";
import User from "./User";
import Orders from './Orders';
import Menu from "./Menu";
import Settings from './Settings'
import Staff from "./Staff"
import Login from "./Login";
import Signup from './Signup';
import NoBusinessFound from './Component/NoBusinessFound';

function App() {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const saveToCloudBtnStatus = useSelector(state => state.conditionalValues.saveToCloudBtnStatus);
	const userRegisterStatus = useSelector(state => state.conditionalValues.userRegisterStatus)

	const handleGetAppData = (userData) => {
		if (userData) {
			dispatch(setIsGetAppData(true))
			const accessToken = userData.accessToken

			if (userData.userInfo.role !== 'BUSINESS_MANAGER') {
				dispatch(setUserRegisterStatus('LOGGED_OUT'))
				dispatch(setIsGetAppData(false))
				AUTH_signout()
				navigate("/login")
				return
			}

			dispatch(setUserRegisterStatus('LOGGED_IN'))
			dispatch(addUser(userData))
			fetchStaff(accessToken).then(res => dispatch(initStaff(res)))
			DB_GET_DOC('menus', accessToken).then(res => dispatch(addMenu(res)))
			DB_GET_DOC('businesses', accessToken).then(res => dispatch(initBusiness(res)))

			dispatch(setIsGetAppData(false))

		} else {
			dispatch(setUserRegisterStatus('LOGGED_IN_NO_BUSINESS'))
		}
	}

	useEffect(() => {
		AUTH_ON_CHANGE()
		.then(userData => {
			handleGetAppData(userData)
		})
	}, [])

	useEffect(() => {
		const handleBeforeUnload = (e) => {
			if (saveToCloudBtnStatus === 'ON_CHANGES') {
				e.preventDefault();
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [saveToCloudBtnStatus])

	 useEffect(() => {
    userRegisterStatus === 'LOGGED_OUT' && navigate('/login')
    userRegisterStatus === 'LOGGED_IN_NO_BUSINESS' && navigate('/')
    userRegisterStatus === 'LOGGED_IN' && navigate('/menu')
  }, [userRegisterStatus])


	return (

		<>
			{
				userRegisterStatus === 'LOGGED_IN' &&
					<>
						<div className="side-bar-container"><SideBar /></div>
						<div className="content">
							<Routes>
								<Route path="/" element={<Home />} />
								{/*<Route path="/user" element={<User />} />*/}
								<Route path="/orders" element={<Orders />} />
								<Route path="/menu" element={<Menu />} />
								<Route path="/settings" element={<Settings />} />
								<Route path="/staff" element={<Staff />} />
							</Routes>
						</div>
					</>
			}

			{
				userRegisterStatus === 'LOGGED_OUT' &&
					<Routes>
						<Route path="/login" element={<Login />} />
						<Route path="/signup" element={<Signup />} />
					</Routes>
			}

			{
				userRegisterStatus === 'LOGGED_IN_NO_BUSINESS' && <Routes><Route path='/' element={<NoBusinessFound />} /></Routes>
			}
			
	</>

	);
}

export default App;