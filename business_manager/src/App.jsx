import { useEffect } from "react";
import "./style/Normaliz.css";
import "./style/all.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { addUser } from "./rtk/slices/userSlice.js";

// Functions
import startApp from "./functions/startApp.js";

// Components
// import SideBar from "./Component/SideBar.jsx";

// Pages
import PrivateRoute from "./PrivateRoute.jsx";
import Home from "./Home.jsx";
import Login from "./Login.jsx";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {

    startApp()
      .then(userData => {
        dispatch(addUser(userData));
        navigate("/");
      }).catch(error => {
        console.log(error);
        navigate("/login");
      })

  }, [])

  return (

    <>
      <div className="side-bar-container">{/*<SideBar />*/}</div>
      <div className="content">
        
        <Routes>
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
        </Routes>

      </div>
    </>

  );
}

export default App;