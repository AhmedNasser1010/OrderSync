import React, { useState } from "react";

// Components
import Tab from "./Component/Tab";
import RestaurantsManagement from "./RestaurantsManagement.jsx";
import RestaurantsOrdersList from "./RestaurantsOrdersList.jsx";
import RestaurantsPendingOrders from "./RestaurantsPendingOrders.jsx";
import PageTitle from "./Component/PageTitle";

// fx
import fromKebabToTitle from "./function/fromKebabToTitle.js";


const Restaurants = () => {
    const [currentTab, setCurrentTab] = useState("");

    const setCurrentTabState = (value) => {
        setCurrentTab(value);
    }

    return (
        <div className="Restaurants">
            <PageTitle title={`Restaurants - ${fromKebabToTitle(currentTab)}`} />

            <Tab
                setCurrentTabState={setCurrentTabState}
                tabs={[
                    {path: "management", title: "Management"},
                    {path: "orders-list", title: "Orders list"},
                    {path: "pending-orders", title: "Pending orders"}
            ]} />

            <hr />

            { currentTab === "management" && <RestaurantsManagement /> }
            { currentTab === "orders-list" && <RestaurantsOrdersList /> }
            { currentTab === "pending-orders" && <RestaurantsPendingOrders /> }
        </div>
    )
}

export default Restaurants;