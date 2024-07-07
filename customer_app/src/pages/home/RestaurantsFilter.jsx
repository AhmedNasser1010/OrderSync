import { IoClose } from "react-icons/io5"
import { useTranslation } from 'react-i18next'

function RestaurantsFilter() {
	const { t } = useTranslation()

	const handleFastDelivery = () => {
		// setFilteredRestaurants(AllRestaurants.filter(res => res?.info?.sla?.deliveryTime >= 30 && res?.info?.sla?.deliveryTime <= 50))
	}

	const handleRating = () => {
		// setFilteredRestaurants(AllRestaurants.filter(res => res?.info?.avgRating > 4.0))
	}

	const handlePureVeg = () => {
		// setFilteredRestaurants(AllRestaurants.filter(res => res?.info?.badges?.imageBadges))
	}

	const handleOffers = () => {
		// setFilteredRestaurants(AllRestaurants.filter(res => res?.info?.aggregatedDiscountInfoV3?.header || res?.info?.aggregatedDiscountInfoV3?.subHeader))
	}

	const handlePriceRange300to600 = () => {
		// const MinPrice = "300", MaxPrice = "600"
		// setFilteredRestaurants(AllRestaurants.filter(res => res?.info?.costForTwo?.slice(1, 4) >= MinPrice && res?.info?.costForTwo?.slice(1, 4) <= MaxPrice))
	}

	const handlePriceRangeLessthan300 = () => {
		// const MinPrice = "300"
		// setFilteredRestaurants(AllRestaurants.filter(res => res?.info?.costForTwo?.slice(1, 4) <= MinPrice))
	}

	const handleActive = (e) => {
		e.target.classList.add("active")
	}

	return (

		<div className="filter-btns flex gap-3 2xl:justify-start justify-center md:flex-nowrap flex-wrap" onClick={handleActive}>
			<button className='filter-btn font-GrotMed text-color-3 text-sm tracking-tight' onClick={handleFastDelivery}>
				{t("Fast Delivery")}
				<span className='text-lg ml-1 mb-[2px] hidden' onClick={() => window.location.reload()}>
					<IoClose />
				</span>
			</button>
			<button className='filter-btn font-GrotMed text-color-3 text-sm tracking-tight' onClick={handleRating}>
				{t("Rating 4.0+")}
				<span className='text-lg ml-1 mb-[2px] hidden' onClick={() => window.location.reload()}>
					<IoClose />
				</span>
			</button>
			<button className='filter-btn font-GrotMed text-color-3 text-sm tracking-tight' onClick={handlePureVeg}>
				{t("Pure Veg")}
				<span className='text-lg ml-1 mb-[2px] hidden' onClick={() => window.location.reload()}>
					<IoClose />
				</span>
			</button>
			<button className='filter-btn font-GrotMed text-color-3 text-sm tracking-tight' onClick={handleOffers}>
				{t("Offers")}
				<span className='text-lg ml-1 mb-[2px] hidden' onClick={() => window.location.reload()}>
					<IoClose />
				</span>
			</button>
			<button className='filter-btn font-GrotMed text-color-3 text-sm tracking-tight' onClick={handlePriceRange300to600}>
				{t("80-220 L.E.")}
				<span className='text-lg ml-1 mb-[2px] hidden' onClick={() => window.location.reload()}>
					<IoClose />
				</span>
			</button>
			<button className='filter-btn font-GrotMed text-color-3 text-sm tracking-tight' onClick={handlePriceRangeLessthan300}>
				{t("Less then 120 L.E.")}
				<span className='text-lg ml-1 mb-[2px] hidden' onClick={() => window.location.reload()}>
					<IoClose />
				</span>
			</button>
		</div>

	)
}

export default RestaurantsFilter