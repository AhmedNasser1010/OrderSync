// React Router
import { Link } from "react-router-dom";

// Redux
import { useDispatch } from "react-redux";
import { clearUser } from '../rtk/slices/userSlice'
import { clearMenu } from '../rtk/slices/menuSlice'

import useLogout from '../hooks/useLogout'

// Firebase
import { auth } from "../firebase.js";

const SideBarList = () => {
	const logout = useLogout()
	const dispatch = useDispatch();
	
	const handleSignout = () => {
		logout()
	}

	return (

		<ul>
			<li className="link"><Link to={auth.currentUser ? "/user" : "/login"}>User Profile</Link></li>
			<li className="link"><Link to={auth.currentUser ? "/orders" : "/login"}>Orders</Link></li>
			<li className="link"><Link to={auth.currentUser ? "/staff" : "/login"}>Staff</Link></li>
			<li className="link"><Link to={auth.currentUser ? "/menu" : "/login"}>Menu Setup</Link></li>
			<li className="link"><Link to={auth.currentUser ? "/settings" : "/login"}>Settings</Link></li>
			<li className="link" onClick={handleSignout}><Link to="/login">Logout</Link></li>
		</ul>

	)
}

export default SideBarList;