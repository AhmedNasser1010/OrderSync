import { useParams } from "react-router-dom";
import React, { useState, useEffect } from 'react';

// Components
import PageTitle from "./Component/PageTitle.jsx";
import Img from "./Component/Img.jsx";

// API
import getItems from "./api/getItems.js";

function ViewItem() {
	const [product, setProduct] = useState([]);
	const productId = useParams().productId;

	useEffect(() => {

		getItems("products/", productId).then(res => setProduct(res));

	}, []);

	return (

		<div className="view-product">
			<PageTitle title={`Product: ${product.title} - ${product.category}`} />
			<Img src={product.image} alt="product image" />
			<p>{product.description}</p>
			<span>Price: {product.price}</span>
		</div>

	);
}

export default ViewItem;