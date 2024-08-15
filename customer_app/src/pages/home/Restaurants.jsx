import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import RestaurantsFilter from './RestaurantsFilter'
import RestaurantCard from '../../components/RestaurantCard'

function Restaurants() {
  const { t } = useTranslation()
  const restaurants = useSelector((state) => state.restaurants)

  return (
    <>
      {restaurants && restaurants?.length != 0 && (
        <>
          <section id="restaurants">
            <h2 className="font-GrotBlack text-2xl pb-5 pt-5 2xl:text-start text-center sm:px-0 px-2">
              {t('Restaurants with online food delivery to El Ayat')}
            </h2>

            <RestaurantsFilter />

            <div className="flex gap-8 flex-wrap mt-10 2xl:justify-start justify-center">
              {restaurants?.map((res) => (
                <Link
                  className="relative transition-all hover:scale-95"
                  key={res?.accessToken}
                  to={`/${res?.business.name.split(' ').join('-')}`}>
                  <RestaurantCard
                    info={{
                      areaName: t('El-Ayat'),
                      name: res?.business?.name,
                      nameInAr: res?.business?.nameInAr || res?.business?.name,
                      avgRating: '4.5',
                      cloudinaryImageId: res?.business?.cover,
                      sla: `${res.services.cookTime[0] / 60000}-${res.services.cookTime[1] / 60000} ${t('min')}`,
                      cuisines: res?.business?.cuisines,
                      availability: res?.settings?.siteControl?.availability,
                      isBusy: res?.settings?.siteControl?.isBusy,
                      temporaryPause: res?.settings?.siteControl?.temporaryPause,
                      closeMsg: res?.settings?.siteControl?.closeMsg,
                      promotionalSubtitle: res?.business?.promotionalSubtitle
                    }}
                  />
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  )
}

export default Restaurants
