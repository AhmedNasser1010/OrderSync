import "./style/Normaliz.css";
import "./style/all.css";
import { Routes, Route } from "react-router-dom";

// Components
import SideBar from "./Component/SideBar.jsx";

// Pages
import PrivateRoute from "./PrivateRoute.jsx";
import Home from "./Home.jsx";
import User from './User.jsx';
import Performance from './Performance.jsx';
import Restaurants from './Restaurants.jsx';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import AddNewRestaurant from './AddNewRestaurant.jsx';


function App() {
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
          <Route path="/restaurants" element={<PrivateRoute><Restaurants /></PrivateRoute>} />
          <Route path="/restaurants/new" element={<PrivateRoute><AddNewRestaurant /></PrivateRoute>} />
        </Routes>

      </div>
    </>

  );
}

export default App;