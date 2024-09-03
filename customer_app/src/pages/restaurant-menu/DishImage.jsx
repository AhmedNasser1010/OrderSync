import foodAndDrinkDesign from '../../../public/assets/FoodAndDrinkDesign.svg'

const DishImage = ({ item }) => {
  return (
    <div className="dish-image-container">
      <button className="cursor-pointer w-[118px] h-24 rounded-md">
        <img
          src={item?.backgrounds[0] || foodAndDrinkDesign}
          alt="menu-img"
          className="rounded-md w-[118px] h-24 object-cover"
        />
      </button>
    </div>
  )
}

export default DishImage
