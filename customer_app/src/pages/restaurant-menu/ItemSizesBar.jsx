import { useTranslation } from 'react-i18next'
import SizeOptionBtn from './SizeOptionBtn'

const options = {
  S: 'Small',
  M: 'Medium',
  L: 'Large'
}

const ItemSizesBar = ({ item, selectedSize, handleSetSelectedSize = () => {} }) => {
  const { t } = useTranslation()
  return (
    <div className={`${!selectedSize && 'hidden'} flex row overflow-hidden w-fit border border-gray-500 border-dashed text-xs mt-2.5 font-ProximaNovaThin`}>
      {item?.sizes?.map(
        (option) =>
          option?.price && (
            <SizeOptionBtn
              key={option?.size}
              isSelected={selectedSize === option?.size}
              onMouseUp={() => handleSetSelectedSize(option?.size)}>
              {t(options[option?.size])}
            </SizeOptionBtn>
          )
      )}
    </div>
  )
}

export default ItemSizesBar
