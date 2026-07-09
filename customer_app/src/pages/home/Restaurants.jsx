import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import RestaurantsFilter from './RestaurantsFilter'
import RestaurantCard from '../../components/RestaurantCard'
import NoRestaurants from './NoRestaurants'

function Restaurants() {
  const { t } = useTranslation()
  const filter = useSelector((state) => state.filter)
  const restaurants = useSelector((state) => state.restaurants)

  const filteredRestaurants = useMemo(() => {
    if (filter.length && restaurants.length) {
      return restaurants.filter((res) => filter.some((tag) => res?.metadata?.includes(tag)));
    }
    return restaurants;
  }, [restaurants, filter]);


  return (
    <section id="restaurants">
      <h2 className="font-GrotBlack text-2xl pb-5 pt-5 2xl:text-start text-center sm:px-0 px-2">
        {t('Restaurants with online food delivery in El Ayat')}
      </h2>

      <RestaurantsFilter />

      {filteredRestaurants && filteredRestaurants.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-10">
          {filteredRestaurants.map((res) => (
            <Link
              className="relative transition-all hover:scale-95"
              key={res?.accessToken}
               to={`/${res?.profile.name.split(' ').join('-')}`}>
              <RestaurantCard
                info={{
                  areaName: t('El-Ayat'),
                  name: res?.profile?.name,
                  nameInAr: res?.profile?.nameInAr || res?.profile?.name,
                  avgRating: '4.5',
                  cloudinaryImageId: res?.branding?.cover,
                  sla: `${res.operations.cookTime[0]}-${res.operations.cookTime[1]} ${t(
                    'min'
                  )}`,
                  cuisines: res?.profile?.cuisines,
                  status: res?.status,
                  promotionalSubtitle: res?.branding?.promotionalSubtitle
                }}
              />
            </Link>
          ))}
        </div>
      ) : (
        <NoRestaurants />
      )}
    </section>
  )
}

export default Restaurants
