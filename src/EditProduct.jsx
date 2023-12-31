import React from 'react';
import { useParams } from "react-router-dom";

// Components
import PageTitle from "./Component/PageTitle.jsx";
import Form from "./Component/Form.jsx";

const EditProduct = () => {
	const itemId = useParams().productId;

	const formSettings = {
		theme: "theme1",
		endpoint: "products/",
		afterSubmitNavigatePath: "/",
		apiAction: "PUT",
		itemId: itemId,
		fields:[
			{ tag: "input", type: "text", name: "title", title: "Title", defaultData: "" },
			{ tag: "input", type: "text", name: "image", title: "Image Link", defaultData: "" },
			{ tag: "input", type: "text", name: "category", title: "Category", defaultData: "" },
			{ tag: "textarea", type: "text", name: "Description", title: "Description", defaultData: "" },
			{ tag: "input", type: "text", name: "price", title: "Price", defaultData: 1 },
		],
	};

	return (

		<div className="edit-product">
			<PageTitle title={`Edit - Item`} />
			<Form settings={formSettings} />
		</div>

	);
}

export default EditProduct;