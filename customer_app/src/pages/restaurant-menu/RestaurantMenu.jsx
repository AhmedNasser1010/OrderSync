import { useState, useMemo, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import useRestaurantMenu from '../../hooks/useRestaurantMenu'
import RestaurantCategory from './RestaurantCategory'
import RestaurantInfo from './RestaurantInfo'
import ShimmerMenu from "../../components/Shimmer/ShimmerMenu"

const RestaurantMenu = () => {
  const { t } = useTranslation()
  const { i18n } = useTranslation()
  const lang = i18n?.language || 'ar'
  const { resId } = useParams()
  const resMenu = useRestaurantMenu()
  const restaurants = useSelector(state => state.restaurants)
  const menu = useSelector(state => state.menu)
  
  const res = useMemo(() => {
    return restaurants.filter(res => res.business.name === resId.split('-').join(' '))[0]
  }, [resId, restaurants])

  useEffect(() => {
    res?.accessToken && resMenu(res.accessToken)
  }, [res])

  const ResInfoData = {
    name: lang === 'ar' ? res?.business?.nameInAr : res?.business?.name,
    id: resId,
    img: res?.business?.cover,
    place: t('El-Ayat'),
    deliveryfee: 7/100
  }

  const resMainInfo = {
    city: t('El-Ayat'),
    name: lang === 'ar' ? res?.business?.nameInAr : res?.business?.name,
    cuisines: ['Pizza', 'Krib', 'Shawrma'],
    areaName: t('El-Ayat'),
    sla: '30-45 ' + t('min'),
    avgRating: '4.5',
    totalRatingsString: t('500+ ratings'),
    feeDetails: 'fee fee'
  }

  if (menu && !menu.categories.length || res.accessToken !== menu.accessToken) {
    return <ShimmerMenu />
  } else {
    const hash = window.location.hash
    const el = hash && document.querySelector(hash) || null // null !!
    el && el && el.scrollIntoView()
  }

  return (
    <div className="mx-auto mt-24 mb-10 2xl:w-1/2 md:w-4/5 sm:px-7 px-2">
      <>
        <RestaurantInfo resMainInfo={resMainInfo} />
        <hr className='border-1 border-dashed border-b-[#d3d3d3] my-4'></hr>

        {
          true ?
            <ul className="main-menu-container">
              {
                menu?.categories?.map((category, i) => (

                  <li key={category?.id} className='cursor-pointer' id={`category-${i+1} ${category.id}`}>
                    <RestaurantCategory
                      id={category?.id}
                      resId={res?.accessToken}
                      title={category?.title}
                      ResInfoData={ResInfoData}
                    />
                  </li>

                ))
              }
            </ul>
            :
            <h2 className="resMsg font-ProximaNovaMed text-sm">{t("Uh-oh! The outlet is not accepting orders at the moment. We're working to get them back online")}</h2>
        }

      </>

    </div>
  )
}

export default RestaurantMenu