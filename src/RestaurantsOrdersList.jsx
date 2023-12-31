import React from "react";

// Components
import Table from "./Component/Table.jsx";

const RestaurantsOrdersList = () => {
    return (
        <section className="restaurants-orders-list">
            <Table
                endPoint={"categories"}
				colTitles={["ID", "Title"]}
				theme="styled-table"
				skipItems={["image"]}
                deleteBtn={false}
                readBtn={false}
                editBtn={false}
            />
        </section>
    )
}

export default RestaurantsOrdersList;