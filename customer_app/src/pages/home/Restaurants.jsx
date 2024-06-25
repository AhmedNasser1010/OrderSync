import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import RestaurantsFilter from './RestaurantsFilter'
import RestaurantCard, { withOfferLabel } from '../../components/RestaurantCard'

function Restaurants() {
	const restaurants = useSelector(state => state.restaurants)

	return (
		<>
			{
				(restaurants && restaurants?.length != 0) &&
				<>
					<section id='restaurants'>
						<h2 className='font-GrotBlack text-2xl pb-5 pt-5 2xl:text-start text-center sm:px-0 px-2'>Restaurants with online food delivery in Ayyat</h2>

						<RestaurantsFilter />

						<div className='flex gap-8 flex-wrap mt-10 2xl:justify-start justify-center'>
							{
								restaurants?.map((res) => (
								  <Link className='relative transition-all hover:scale-95' key={res?.accessToken} to={`/restaurants/${res?.accessToken}`}>
								    {
								      // res?.info?.aggregatedDiscountInfoV3 ? <RestaurantCardwithOffer info={res?.info} /> : <RestaurantCard info={res?.info} />
								    	<RestaurantCard info={{
											    areaName: 'Ayyat',
											    name: res?.business?.name,
											    avgRating: '4.5',
											    cloudinaryImageId: res?.business?.cover,
											    sla: '30-45 min',
											    cuisines: ['Pizza', 'Krib', 'Shawrma'],
											    availability: true,
										  	}}
										  />
								    }
								  </Link>
								))
							}
						</div>

					</section>
				</>
			}
		</>
	)
}

export default Restaurants