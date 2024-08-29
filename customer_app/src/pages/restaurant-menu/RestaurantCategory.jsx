import { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import AccordionHeader from './AccordionHeader'
import AccordionBody from './AccordionBody'

const RestaurantCategory = ({ categoryID, resID, categoryTitle, resAvailability }) => {
  const menuItems = useSelector((state) => state.menu.items)
  const cartItems = useSelector((state) => state.cart.items)
  const [showCategory, setShowCategory] = useState(true)

  const filteredMenuItems = useMemo(() => {
    const menu = menuItems.filter((item) => item.category === categoryID)
    return menu.map(item => ({
      ...item,
      selectedSize: item?.sizes?.length && item?.sizes?.[0]?.price && item?.sizes?.[0] || null
    }))
  }, [menuItems])

  const handleAccordionBody = () => {
    setShowCategory((showCategory) => !showCategory)
  }

  return (
    <div>
      <AccordionHeader
        itemsLength={filteredMenuItems?.length || ''}
        categoryTitle={categoryTitle}
        handleAccordionBody={handleAccordionBody}
        showCategory={showCategory}
      />

      {showCategory && (
        <AccordionBody
          filteredMenuItems={filteredMenuItems}
          resID={resID}
          resAvailability={resAvailability}
          cartItems={cartItems}
        />
      )}
    </div>
  )
}

export default RestaurantCategory
