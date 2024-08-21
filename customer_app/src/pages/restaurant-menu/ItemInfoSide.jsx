import ItemAvailability from './ItemAvailability'
import ItemTitle from './ItemTitle'
import DiscountMsg from './DiscountMsg'
import ItemPrice from './ItemPrice'
import ItemDescription from './ItemDescription'
import ItemSizesBar from './ItemSizesBar'
import useItemInfo from '../../hooks/useItemInfo'

const ItemInfoSide = ({ item, resID }) => {
  const {
    selectedSize,
    itemPrice,
    afterDiscount,
    discountIncluded,
    handleSetSelectedSize
  } = useItemInfo(item, resID)

  return (
    <div className="md:w-auto w-3/5">
      <ItemAvailability />
      <ItemTitle title={item?.title} discountIncluded={discountIncluded} />
      <DiscountMsg discountMsg={item?.discount?.message} discountIncluded={discountIncluded} />
      <ItemPrice price={itemPrice} finalPrice={afterDiscount?.finalPrice} discountIncluded={discountIncluded} />
      <ItemDescription description={item?.description} />
      <ItemSizesBar
        item={item}
        selectedSize={selectedSize}
        handleSetSelectedSize={handleSetSelectedSize}
      />
    </div>
  )
}

export default ItemInfoSide
