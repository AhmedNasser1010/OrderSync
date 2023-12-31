import PageTitle from "./Component/PageTitle.jsx";
import React from 'react';

// Components
import Table from "./Component/Table.jsx";

function Categories() {
	return (

		<div className="categories">
			<PageTitle title="Categories" />
			<Table
				endPoint={"categories"}
				colTitles={["ID", "Title", "Action"]}
				theme="styled-table"
			/>
		</div>

	);
}

export default Categories;