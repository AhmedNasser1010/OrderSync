import React from "react";

const FormLabel = ({ labelData: { title, name, type, tag }, value, onChangeEvent }) => {

    const DynamicTag = tag || "input";
    
    return (
        <label>
			{ title }
			<DynamicTag
                value={value}
                type={type}
                placeholder={title}
                name={name}
                onChange={onChangeEvent}
            />
		</label>
    )
}

export default FormLabel