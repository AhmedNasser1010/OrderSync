import React from 'react';

import "./style/Normaliz.css";
import "./style/all.css";
import { Routes, Route } from "react-router-dom";

// Components
import SideBar from "./Component/SideBar.jsx";

// Pages
import Overview from "./Overview.jsx";
import User from './User.jsx';
import Performance from './Performance.jsx';
import Restaurants from './Restaurants.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import AddNewRestaurant from './AddNewRestaurant.jsx';

// import AddProduct from "./AddProduct.jsx";
// import ViewItem from "./ViewItem.jsx";
// import EditProduct from "./EditProduct.jsx";


function App() {
  return (

    <>
      <div className="side-bar-container"><SideBar /></div>
      <div className="content">
        
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/user" element={<User />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/restaurants/new" element={<AddNewRestaurant />} />

          {/* <Route path="new" element={<AddProduct />} /> */}
          {/* <Route path="item/:productId" element={<ViewItem />} /> */}
          {/* <Route path="products/edit/:productId" element={<EditProduct />} /> */}
        </Routes>

      </div>
    </>

  );
}

export default App;