import ShimmerHome from '../../components/Shimmer/ShimmerHome';
import { useSelector } from 'react-redux';

import WhatsOnYourMind from './WhatsOnYourMind'
import TopRestaurant from './TopRestaurant'
import Restaurants from './Restaurants'

const Home = () => {
	const restaurants = useSelector(state => state.restaurants)

	if (restaurants.length <= 0) return <ShimmerHome />

	return (
		<div className="container mx-auto mt-24 mb-10 px-2 sm:px-10 overflow-x-hidden">
			<WhatsOnYourMind />
			<div className="divider"></div>

			<TopRestaurant />
			<div className="divider"></div>

			<Restaurants />
		</div>
	)
}

export default Home