import { useEffect } from "react";
import "./style/Normaliz.css";
import "./style/all.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { addUser } from "./rtk/slices/userSlice.js";

// Functions
import startApp from "./function/startApp.js";
import authSignOut from './function/authSignOut'

// Components
import SideBar from "./Component/SideBar.jsx";

// Pages
import PrivateRoute from "./PrivateRoute.jsx";
import Home from "./Home.jsx";
import User from './User.jsx';
import Performance from './Performance.jsx';
import Businesses from './Businesses.jsx';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import AddNewBusiness from './AddNewBusiness.jsx';
import BusinessSettings from "./BusinessSettings.jsx";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {

    startApp()
      .then(userData => {
        if (userData.userInfo.role !== 'BUSINESSES_CREATOR') {
          authSignOut()
          navigate("/login")
          return
        }

        dispatch(addUser(userData));
        navigate("/");
      }).catch(error => {
        console.log(error);
        navigate("/login");
      })

  }, [])

  return (

    <>
      <div className="side-bar-container"><SideBar /></div>
      <div className="content">
        
        <Routes>
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/user" element={<PrivateRoute><User /></PrivateRoute>} />
          <Route path="/performance" element={<PrivateRoute><Performance /></PrivateRoute>} />
          <Route path="/businesses" element={<PrivateRoute><Businesses /></PrivateRoute>} />
          <Route path="/businesses/new" element={<PrivateRoute><AddNewBusiness /></PrivateRoute>} />
          <Route path="/businesses/:accessToken" element={<PrivateRoute><BusinessSettings /></PrivateRoute>} />
        </Routes>

      </div>
    </>

  );
}

export default App;