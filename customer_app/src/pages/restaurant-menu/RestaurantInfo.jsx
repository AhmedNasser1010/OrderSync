import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next'

const RestaurantInfo = ({ resMainInfo }) => {
  const { t } = useTranslation()
  const {
    city,
    name,
    cuisines,
    areaName,
    sla,
    avgRating,
    totalRatingsString
  } = resMainInfo

  return (
    <>
      <div className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse text-color-5">
          <li className="inline-flex items-center">
            <Link
              to="/"
              className="inline-flex items-center text-xs font-medium"
            >
              {t("Home")}
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <Link to='/' className="ms-1 text-xs font-medium">{city}</Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg
                className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <span className="ms-1 text-xs font-medium text-[#535665]">
                {name}
              </span>
            </div>
          </li>
        </ol>
      </div>

      <div className=" mt-10">
        <h1 className="font-GrotBlack text-2xl">{name}</h1>

        <div className="mt-14 flex justify-between">
          <div>
            <h2 className="font-ProximaNovaSemiBold text-xl">{name}</h2>
            <p className="text-color-8 text-xs font-ProximaNovaThin mb-1 mt-1">
              {cuisines?.join(", ")}
            </p>
            <p className="text-color-8 text-xs font-ProximaNovaThin">
              {areaName}, {sla}
            </p>
          </div>
          {avgRating && (
            <div>
              <button className="sm:max-w-[100px] sm:w-auto w-[100px] p-2 text-center border border-color-7 rounded-md cursor-pointer">
                <div className="text-[#3d9b6d] pb-[10px] border border-b-color-7 border-l-0 border-t-0 border-r-0 mb-2 font-ProximaNovaSemiBold flex justify-center items-center gap-1">
                  <span>
                    <img src="/assets/star-icon.png" alt="star-icon" />
                  </span>
                  <span className="text-sm">{avgRating}</span>
                </div>
                <div className="text-xs text-[#8b8d97] font-ProximaNovaBold tracking-tighter">
                  {totalRatingsString}
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RestaurantInfo;
