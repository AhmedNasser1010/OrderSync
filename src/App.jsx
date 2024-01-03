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
import Businesses from './Businesses.jsx';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import AddNewBusinesse from './AddNewBusinesse.jsx';


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
          <Route path="/businesses" element={<PrivateRoute><Businesses /></PrivateRoute>} />
          <Route path="/businesses/new" element={<PrivateRoute><AddNewBusinesse /></PrivateRoute>} />
        </Routes>

      </div>
    </>

  );
}

export default App;