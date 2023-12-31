import React from 'react';
import Form from './Component/Form.jsx';

// Components
import PageTitle from "./Component/PageTitle.jsx";

function AddProduct() {

	const formSettings = {
		theme: "theme1",
		endpoint: "products/",
		afterSubmitNavigatePath: "/",
		apiAction: "POST",
		fields:[
			{ tag: "input", type: "text", name: "title", title: "Title", defaultData: "" },
			{ tag: "input", type: "text", name: "image", title: "Image Link", defaultData: "" },
			{ tag: "input", type: "text", name: "category", title: "Category", defaultData: "" },
			{ tag: "textarea", type: "text", name: "Description", title: "Description", defaultData: "" },
			{ tag: "input", type: "text", name: "price", title: "Price", defaultData: 1 },
		],
	};

	return (

		<div className="add-product">
			<PageTitle title="Add a New Product" />
			<Form settings={formSettings} />
		</div>

	);
}

export default AddProduct;