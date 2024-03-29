import { useEffect } from "react";
import "./style/Normaliz.css";
import "./style/all.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from "./rtk/slices/userSlice.js";

// Functions
import startApp from "./functions/startApp.js";

// Components
import SideBar from "./Component/SideBar.jsx";

// Pages
import PrivateRoute from "./PrivateRoute.jsx";
import Home from "./Home.jsx";
import User from "./User.jsx";
import Menu from "./Menu.jsx";
import Login from "./Login.jsx";

function App() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const saveToCloudBtnStatus = useSelector(state => state.conditionalValues.saveToCloudBtnStatus);

	useEffect(() => {

		startApp()
			.then(userData => {
				dispatch(addUser(userData));
				navigate("/menu");
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
					<Route path="/menu" element={<PrivateRoute><Menu /></PrivateRoute>} />
					<Route path="/login" element={<Login />} />
				</Routes>

			</div>
			
		</>

	);
}

export default App;