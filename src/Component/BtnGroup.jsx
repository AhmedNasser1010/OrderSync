import React from "react";

// Components
import EditItemBtn from "./EditItemBtn.jsx";
import ViewItemBtn from "./ViewItemBtn.jsx";
import DeleteItemBtn from "./DeleteItemBtn.jsx";

const BtnGroup = ({ id, editBtn, readBtn, deleteBtn }) => {
    return (
        <th className="btn-group">
            { editBtn && <EditItemBtn id={id} /> }
			{ readBtn && <ViewItemBtn id={id} /> }
			{ deleteBtn && <DeleteItemBtn id={id} /> }
        </th>
    )
}

export default BtnGroup;