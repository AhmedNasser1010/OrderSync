import { useTranslation } from "react-i18next"

const NoRestaurants = () => {
  const { t, i18n } = useTranslation()
  return (
    <div>
      <span className={`block font-Beiruti text-gray-500 text-center font-bold max-w-[190px] mx-auto py-6 leading-6 ${i18n.language === 'ar' ? 'text-3xl' : 'text-[23px]'}`}>{t("No Restaurants found, try another filter")}</span>
      <img src='./assets/restaurant.png' alt='no restaurants' className='w-56 mx-auto pb-28 grayscale' />
    </div>
  )
}

export default NoRestaurants