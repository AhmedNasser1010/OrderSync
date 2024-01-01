import React from "react";
import { Link, useNavigate } from "react-router-dom";

// Firebase
import { getAuth, signOut} from "firebase/auth";
import { initializeApp } from "firebase/app";


const SideBarList = () => {
	const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const navigate = useNavigate();

    // keyyyyy

    const signOutMethod = () => {
        // setInProgress(true);
        signOut(auth)
            .then(() => {navigate("/login")})
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error(errorCode);
                console.error(errorMessage);

                // setInProgress(false);
                // setFormErrorMessage(errorMessage);
            });
    }

    return (

        <ul>
            <li className="link"><Link to="/user">User Profile</Link></li>
            <li className="link"><Link to="/">Overview</Link></li>
            <li className="link"><Link to="/performance">Performance</Link></li>
            <li className="link"><Link to="/restaurants">Restaurants</Link></li>
            <li className="link"><Link to="/login">Logout</Link></li>
        </ul>

    )
}

export default SideBarList;