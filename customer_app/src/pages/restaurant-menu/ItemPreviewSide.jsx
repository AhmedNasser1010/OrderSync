import DishImage from './DishImage'
import PlaceItemBtn from './PlaceItemBtn'

const ItemPreviewSide = ({ item, status, resID }) => {
  return (
    <div className="relative w-[118px] h-24">
      <DishImage item={item} />
      <PlaceItemBtn item={item} status={status} resID={resID} />
    </div>
  )
}

export default ItemPreviewSide
