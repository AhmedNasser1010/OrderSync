import { useEffect } from "react";
import "./style/Normaliz.css";
import "./style/all.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from "./rtk/slices/userSlice.js";
import { addMenu } from './rtk/slices/menuSlice.js';
import { initBusiness } from './rtk/slices/businessSlice.js';

// Functions
import startApp from "./functions/startApp.js";
import DB_GET_DOC from './functions/DB_GET_DOC';

// Components
import SideBar from "./Component/SideBar.jsx";

// Pages
import PrivateRoute from "./PrivateRoute.jsx";
import Home from "./Home";
import User from "./User";
import Orders from './Orders';
import Menu from "./Menu";
import Settings from './Settings'
import Login from "./Login";
import Workers from "./Workers"

function App() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const saveToCloudBtnStatus = useSelector(state => state.conditionalValues.saveToCloudBtnStatus);

	useEffect(() => {

		startApp()
			.then(userData => {
				dispatch(addUser(userData));
				DB_GET_DOC('menus', userData.accessToken).then(res => dispatch(addMenu(res)));
				DB_GET_DOC('businesses', userData.accessToken).then(res => dispatch(initBusiness(res)));
				navigate("/workers");
			}).catch(error => {
				console.log(error);
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
	}, [saveToCloudBtnStatus]);


	return (

		<>
			<div className="side-bar-container"><SideBar /></div>
			<div className="content">
				
				<Routes>
					<Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
					<Route path="/user" element={<PrivateRoute><User /></PrivateRoute>} />
					<Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
					<Route path="/menu" element={<PrivateRoute><Menu /></PrivateRoute>} />
					<Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
					<Route path="/workers" element={<PrivateRoute><Workers /></PrivateRoute>} />
					<Route path="/login" element={<Login />} />
				</Routes>

			</div>
			
		</>

	);
}

export default App;