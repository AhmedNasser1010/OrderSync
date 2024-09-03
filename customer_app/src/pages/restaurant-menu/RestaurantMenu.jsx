import { useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import SEO from '../../components/SEO'
import useRestaurantMenu from '../../hooks/useRestaurantMenu'
import RestaurantCategory from './RestaurantCategory'
import RestaurantInfo from './RestaurantInfo'
import ShimmerMenu from '../../components/Shimmer/ShimmerMenu'
import MenuPopups from './MenuPopups'
import { resetPopupStates } from '../../rtk/slices/toggleSlice'

const RestaurantMenu = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { i18n } = useTranslation()
  const lang = i18n?.language || 'ar'
  const { resId } = useParams()
  const resMenu = useRestaurantMenu()
  const restaurants = useSelector((state) => state.restaurants)
  const menu = useSelector((state) => state.menu)

  const res = useMemo(() => {
    return restaurants.filter((res) => res.business.name === resId.split('-').join(' '))[0]
  }, [resId, restaurants])
  const resName = lang === 'ar' ? res?.business?.nameInAr : res?.business?.name

  useEffect(() => {
    res?.accessToken && resMenu(res.accessToken)
  }, [res])

  useEffect(() => {
    dispatch(resetPopupStates())
  }, [])

  const resMainInfo = {
    city: t('El-Ayat'),
    name: lang === 'ar' ? res?.business?.nameInAr : res?.business?.name,
    cuisines: res?.business?.cuisines,
    areaName: t('El-Ayat'),
    sla: `${res?.services?.cookTime[0] / 60000}-${res?.services?.cookTime[1] / 60000} ${t('min')}`,
    avgRating: '4.5',
    totalRatingsString: t('500+ ratings')
  }

  if ((menu && !menu.categories.length) || res.accessToken !== menu.accessToken) {
    return <ShimmerMenu />
  } else {
    const hash = window.location.hash
    const el = (hash && document.querySelector(hash)) || null // null !!
    el && el && el.scrollIntoView()
  }

  return (
    <div className="mx-auto mt-24 mb-10 2xl:w-1/2 md:w-4/5 sm:px-7 px-2">
      <SEO
        title={` زاكس ايتس | ${resName}`}
        description={`${resName} - نفسك في أكل من مطعم معين؟ اطلب أكلك المفضل من أقرب مطعم ليك في مصر مع زاجل إيتس. جعان اطلب أكلك دلوقتي واستمتع!`}
      />
      <RestaurantInfo resMainInfo={resMainInfo} />
      <hr className="border-1 border-dashed border-b-[#d3d3d3] my-4"></hr>
      {(!res?.settings?.siteControl?.availability && (
        <p className="w-fit mx-auto px-3 py-1 rounded-full text-base font-medium bg-red-100 text-red-800">
          {t(
            'This restaurant is currently closed or outside of working hours. Please check back during our regular hours. We appreciate your understanding.'
          )}
        </p>
      )) ||
        (res?.settings?.siteControl?.isBusy && (
          <p className="w-fit mx-auto px-3 py-1 rounded-full text-base font-medium bg-yellow-100 text-yellow-800">
            {t('This restaurant is currently busy, so your order may take longer than usual.')}
          </p>
        )) ||
        (res?.settings?.siteControl?.temporaryPause && (
          <p className="w-fit mx-auto px-3 py-1 rounded-full text-base font-medium bg-gray-100 text-gray-800">
            {t(
              "This restaurant is temporarily paused, so we can't take any orders at the moment. We apologize for the inconvenience."
            )}
          </p>
        ))}

      {true ? (
        <ul className="main-menu-container">
          {menu?.categories?.map((category, i) => (
            <li
              key={category?.id}
              className="cursor-pointer"
              id={`category-${i + 1} ${category.id}`}>
              <RestaurantCategory
                categoryID={category?.id}
                categoryTitle={category?.title}
                resID={res?.accessToken}
                resAvailability={{
                  availability: res?.settings?.siteControl?.availability,
                  temporaryPause: res?.settings?.siteControl?.temporaryPause,
                  isBusy: res?.settings?.siteControl?.isBusy
                }}
              />
            </li>
          ))}
        </ul>
      ) : (
        <h2 className="resMsg font-ProximaNovaMed text-sm">
          {t(
            "Uh-oh! The outlet is not accepting orders at the moment. We're working to get them back online"
          )}
        </h2>
      )}

      <MenuPopups />
    </div>
  )
}

export default RestaurantMenu
