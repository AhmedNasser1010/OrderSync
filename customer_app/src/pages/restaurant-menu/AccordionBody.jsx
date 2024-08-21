import ItemInfoSide from './ItemInfoSide'
import ItemPreviewSide from './ItemPreviewSide'

const AccordionBody = ({ filteredMenuItems, resID, resAvailability }) => {
  return (
    <div className="accordion-body">
      {filteredMenuItems?.map((item) => (
        <div key={item?.id} className="item flex items-start justify-between pb-8">
          <ItemInfoSide item={item} resID={resID} />
          <ItemPreviewSide item={item} resAvailability={resAvailability} resID={resID} />
        </div>
      ))}
    </div>
  )
}

export default AccordionBody
