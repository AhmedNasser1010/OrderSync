import React from 'react';

import "./style/Normaliz.css";
import "./style/all.css";
import { Routes, Route } from "react-router-dom";

import SideBar from "./Component/SideBar.jsx";
import Home from "./Home.jsx";
import Categories from "./Categories.jsx";
import AddProduct from "./AddProduct.jsx";
import ViewItem from "./ViewItem.jsx";
import EditProduct from "./EditProduct.jsx";


function App() {
  return (

    <>
      <div className="side-bar-container"><SideBar /></div>
      <div className="content">
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="categories" element={<Categories />} />
          <Route path="new" element={<AddProduct />} />
          <Route path="item/:productId" element={<ViewItem />} />
          <Route path="products/edit/:productId" element={<EditProduct />} />
        </Routes>

      </div>
    </>

  );
}

export default App;