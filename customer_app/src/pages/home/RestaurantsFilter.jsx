import { useTranslation } from 'react-i18next'
import Filter from './Filter'

function RestaurantsFilter() {
	const { t } = useTranslation()
	return (
		<div className="filter-btns flex gap-3 2xl:justify-start justify-center md:flex-nowrap flex-wrap">
			{/* <Filter filterId='fast-delivery'>{t("Fast Delivery")}</Filter> */}
			{/* <Filter filterId='rating-4.0+'>{t("Rating 4.0+")}</Filter> */}
			<Filter filterId='offers'>{t("Offers")}</Filter>
			<Filter filterId='sandwiches'>{t("Sandwiches")}</Filter>
			<Filter filterId='crepes'>{t("Crepes")}</Filter>
			<Filter filterId='italian-pizza'>{t("Italian Pizza")}</Filter>
			<Filter filterId='pasta'>{t("Pasta")}</Filter>
		</div>
	)
}

export default RestaurantsFilter