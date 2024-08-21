import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'

const AccordionHeader = ({
  categoryTitle,
  itemsLength,
  showCategory,
  handleAccordionBody
}) => {
  return (
    <div
      className="flex items-center justify-between py-5 px-3 sm:p-6 shadow-md text-left"
      onClick={handleAccordionBody}>
      <h2 className="text-color-9 sm:text-lg font-ProximaNovaBold">
        {categoryTitle} {itemsLength}
      </h2>
      <div className="text-xl text-color-9">
        {showCategory ? <IoIosArrowUp /> : <IoIosArrowDown />}
      </div>
    </div>
  )
}

export default AccordionHeader
