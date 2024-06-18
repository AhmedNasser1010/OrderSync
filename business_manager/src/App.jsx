import { useEffect } from "react";
import "./style/Normaliz.css";
import "./style/all.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from "./rtk/slices/userSlice.js";
import { addMenu } from './rtk/slices/menuSlice.js';
import { initBusiness } from './rtk/slices/businessSlice.js';
import { setUserRegisterStatus } from './rtk/slices/conditionalValuesSlice'

// Functions
import startApp from "./functions/startApp.js";
import DB_GET_DOC from './functions/DB_GET_DOC';
import AUTH_signout from './functions/AUTH_signout'

// Components
import SideBar from "./Component/SideBar.jsx";

// Pages
import PrivateRoute from "./PrivateRoute.jsx";
import Home from "./Home";
import User from "./User";
import Orders from './Orders';
import Menu from "./Menu";
import Settings from './Settings'
import Workers from "./Workers"
import Login from "./Login";
import Signup from './Signup';
import NoBusinessFound from './Component/NoBusinessFound';

function App() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const saveToCloudBtnStatus = useSelector(state => state.conditionalValues.saveToCloudBtnStatus);
	const userRegisterStatus = useSelector(state => state.conditionalValues.userRegisterStatus)


	useEffect(() => {

		startApp()
			.then(userData => {
				if (userData) {
					if (userData.userInfo.role !== 'BUSINESS_MANAGER') {
						dispatch(setUserRegisterStatus('LOGGED_OUT'))
						AUTH_signout()
						navigate("/login")
						return
					}

					dispatch(setUserRegisterStatus('LOGGED_IN'))
					dispatch(addUser(userData));
					DB_GET_DOC('menus', userData.accessToken).then(res => dispatch(addMenu(res)));
					DB_GET_DOC('businesses', userData.accessToken).then(res => dispatch(initBusiness(res)));
					navigate("/workers");

				} else {
					dispatch(setUserRegisterStatus('LOGGED_IN_NO_BUSINESS'))
				}

			}).catch(error => {
				console.log(error);
				dispatch(setUserRegisterStatus('LOGGED_OUT'))
				navigate("/login");
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
    userRegisterStatus === 'LOGGED_IN' && navigate('/user')
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
								<Route path="/user" element={<User />} />
								<Route path="/orders" element={<Orders />} />
								<Route path="/menu" element={<Menu />} />
								<Route path="/settings" element={<Settings />} />
								<Route path="/workers" element={<Workers />} />
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