import React from "react";

// Components
import EditItemBtn from "./EditItemBtn.jsx";
import ViewItemBtn from "./ViewItemBtn.jsx";
import DeleteItemBtn from "./DeleteItemBtn.jsx";

const BtnGroup = ({ id }) => {
    return (
        <th className="btn-group">
            <EditItemBtn id={id} />
			<ViewItemBtn id={id} />
			<DeleteItemBtn id={id} />
        </th>
    )
}

export default BtnGroup;