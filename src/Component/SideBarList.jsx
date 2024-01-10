import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { clearUser } from "../rtk/slices/userSlice.js";

// Functions
import authSignOut from "../function/authSignOut.js";

// Firebase
import { auth } from "../firebase.js";

const SideBarList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const signoutFunc = () => {
        authSignOut();
        dispatch(clearUser());
        navigate("/login");
    }

    return (

        <ul>
            <li className="link"><Link to={auth.currentUser ? "/user" : "/login"}>User Profile</Link></li>
            <li className="link"><Link to={auth.currentUser ? "/" : "/login"}>Overview</Link></li>
            <li className="link"><Link to={auth.currentUser ? "/performance" : "/login"}>Performance</Link></li>
            <li className="link"><Link to={auth.currentUser ? "/businesses" : "/login"}>Businesses</Link></li>
            <li className="link" onClick={signoutFunc}><Link to="/login">Logout</Link></li>
        </ul>

    )
}

export default SideBarList;