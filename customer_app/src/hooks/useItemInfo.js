import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import priceAfterDiscount from '../utils/priceAfterDiscount'
import { selectItemSize } from '../rtk/slices/menuSlice'

const useItemInfo = (item, resID) => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)
  const [selectedSize, setSelectedSize] = useState(item?.selectedSize?.size || null)
  const [itemPrice, setItemPrice] = useState(item?.sizes?.find((s) => s.size === selectedSize)?.price || item.price)
  const [afterDiscount, setAfterDiscount] = useState(item?.discount?.code
    ? priceAfterDiscount(itemPrice, item.discount, user, resID)
    : { finalPrice: itemPrice, isAvailableForUser: false })
  const [discountIncluded, setDiscountIncluded] = useState(afterDiscount?.isAvailableForUser ? itemPrice != afterDiscount?.finalPrice : false)

  const handleSetSelectedSize = (size) => {
    setSelectedSize(size)
    setItemPrice(item.sizes.find((s) => s.size === size)?.price || item.price)
    setAfterDiscount(item?.discount?.code
      ? priceAfterDiscount(itemPrice, item.discount, user, resID)
      : { finalPrice: itemPrice, isAvailableForUser: false })
    setDiscountIncluded(afterDiscount?.isAvailableForUser ? itemPrice != afterDiscount?.finalPrice : false)
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
