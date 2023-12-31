import React from 'react';

import "../style/pageTitle.css";

function PageTitle(props) {
	return (

		<div className="page-title">
			<h1 className="title">{props.title}</h1>
			<span></span>
		</div>

	);
}

export default PageTitle;