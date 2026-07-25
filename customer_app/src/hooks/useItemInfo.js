import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { priceAfterDiscount, resolveItemDiscount } from '@ordersync/order-utils'
import { selectItemSize } from '../rtk/slices/menuSlice'
import { trackDiscountImpression } from '../utils/trackDiscountImpression'

const useItemInfo = (item, resID) => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)
  const categories = useSelector((state) => state.menu.categories)
  const [selectedSize, setSelectedSize] = useState(item?.selectedSize?.size || null)
  const [itemPrice, setItemPrice] = useState(item?.sizes?.find((s) => s.size === selectedSize)?.price || item.price)
  const [afterDiscount, setAfterDiscount] = useState(() => {
    const category = categories?.find((cat) => cat.id === item?.category)
    const effectiveDiscount = resolveItemDiscount(item, category)
    return effectiveDiscount?.code
      ? priceAfterDiscount(itemPrice, effectiveDiscount, user, resID)
      : { finalPrice: itemPrice, isAvailableForUser: false }
  })
  const [discountIncluded, setDiscountIncluded] = useState(afterDiscount?.isAvailableForUser ? itemPrice != afterDiscount?.finalPrice : false)

  useEffect(() => {
    if (discountIncluded && item?.discount?.id) {
      trackDiscountImpression({
        discountId: item.discount.id,
        restaurantId: resID,
      })
    }
  }, [discountIncluded])

  const handleSetSelectedSize = (size) => {
    setSelectedSize(size)
    const newPrice = item.sizes.find((s) => s.size === size)?.price || item.price
    setItemPrice(newPrice)
    const category = categories?.find((cat) => cat.id === item?.category)
    const effectiveDiscount = resolveItemDiscount(item, category)
    const result = effectiveDiscount?.code
      ? priceAfterDiscount(newPrice, effectiveDiscount, user, resID)
      : { finalPrice: newPrice, isAvailableForUser: false }
    setAfterDiscount(result)
    setDiscountIncluded(result?.isAvailableForUser ? newPrice != result?.finalPrice : false)
    dispatch(selectItemSize({ id: item.id, selectedSize: item.sizes.find((s) => s.size === size) }))
  }

  return {
    selectedSize,
    itemPrice,
    afterDiscount,
    discountIncluded,
    handleSetSelectedSize
  }
}

export default useItemInfo
