// React Router
import { Link, useNavigate } from "react-router-dom";

// Redux
import { useDispatch } from "react-redux";
import { clearUser } from '../rtk/slices/userSlice'
import { clearMenu } from '../rtk/slices/menuSlice'

// Functions
import AUTH_signout from "../functions/AUTH_signout.js";

// Firebase
import { auth } from "../firebase.js";

const SideBarList = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	
	const handleSignout = () => {
		dispatch(clearUser());
		dispatch(clearMenu());
		AUTH_signout();
		navigate("/login");
	}

	return (

		<ul>
			<li className="link"><Link to={auth.currentUser ? "/user" : "/login"}>User Profile</Link></li>
			<li className="link"><Link to={auth.currentUser ? "/orders" : "/login"}>Orders</Link></li>
			<li className="link"><Link to={auth.currentUser ? "/menu" : "/login"}>Menu Setup</Link></li>
			<li className="link"><Link to={auth.currentUser ? "/settings" : "/login"}>Settings</Link></li>
			<li className="link" onClick={handleSignout}><Link to="/login">Logout</Link></li>
		</ul>

	)
}

export default SideBarList;