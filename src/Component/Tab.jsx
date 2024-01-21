import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Tab = ({ tabs, setCurrentTabState }) => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const getCurrentTab = new URLSearchParams(location.search).get("tab");

        if (getCurrentTab) {

            setCurrentTabState(getCurrentTab);

            const tabsElements = document.querySelectorAll(`.tabs .tab`);
            const activeTab = document.querySelector(`.tabs .tab.${getCurrentTab}`);

            tabsElements.forEach(tab => {
                tab.classList.remove("active");
            })

            activeTab.classList.add("active");


        } else {

            navigate(`?tab=${tabs[0].path}`);

        }

    }, [location.search])

    const changeTab = (tabName) => {
        navigate(`?tab=${tabName}`);
    }

    return (
        <ul className="tabs">
            {
                tabs.map(tab => (
                    <li key={tab.path} className={`tab ${tab.path}`} style={{color: "blue", display: "block"}}>
                        <span onClick={() => changeTab(tab.path)}>{ tab.title }</span>
                    </li>
                ))
            }
        </ul>
    )
}

export default Tab;