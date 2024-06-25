import { useState, useMemo, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import useRestaurantMenu from '../../hooks/useRestaurantMenu'

import RestaurantCategory from '../../components/RestaurantCategory'
import ShimmerMenu from "../../components/Shimmer/ShimmerMenu"
import RestaurantInfo from '../../components/RestaurantInfo'

const RestaurantMenu = () => {
  const { resId } = useParams()
  useRestaurantMenu(resId)
  const restaurants = useSelector(state => state.restaurants)
  const menu = useSelector(state => state.menu)
  const [ShowIndex, setShowIndex] = useState(0)

  const res = useMemo(() => {
    return restaurants.filter(res => res.accessToken === resId)[0]
  }, [resId, restaurants])

  const ResInfoData = {
    name: res?.business?.name,
    id: resId,
    img: res?.business?.cover,
    place: 'Ayyat',
    deliveryfee: 7/100
  }

  const resMainInfo = {
    city: 'Ayyat',
    name: res?.business?.name,
    cuisines: ['Pizza', 'Krib', 'Shawrma'],
    areaName: 'Ayyat',
    sla: '30-45 min',
    avgRating: '4.5',
    totalRatingsString: '500+ ratings',
    feeDetails: 'fee fee'
  }

  const handleShowItem = (CurrentIndex) => {
    if (CurrentIndex === ShowIndex) {
      setShowIndex(null)
    }
    else {
      setShowIndex(CurrentIndex)
    }
  }

  if (menu && menu?.categories?.length === 0) {
    return <ShimmerMenu />
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
                menu?.categories?.map((category, index) => (

                  <li key={category?.id} className='cursor-pointer'>
                    <RestaurantCategory
                      id={category?.id}
                      resId={res?.accessToken}
                      title={category?.title}
                      ShowItem={index === ShowIndex ? true : false}
                      handleShowItem={() => handleShowItem(index)}
                      ResInfoData={ResInfoData}
                    />
                  </li>

                ))
              }
            </ul>
            :
            <h2 className="resMsg font-ProximaNovaMed text-sm">Uh-oh! The outlet is not accepting orders at the moment. We&apos;re working to get them back online</h2>
        }

      </>

    </div>
  )
}

export default RestaurantMenu