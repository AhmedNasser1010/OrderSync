// Suggested code may be subject to a license. Learn more: ~LicenseLog:4137624169.
import { useRef, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoClose } from 'react-icons/io5'
import { addFilter, removeFilter } from '../../rtk/slices/filterSlice'

const Filter = ({ children, filterId }) => {
  const dispatch = useDispatch()
  const buttonRef = useRef()
  const [isActive, setIsActive] = useState(false)
  const filter = useSelector((state) => state.filter)

  useEffect(() => {
    setIsActive(filter.includes(filterId))
  }, [filter, filterId])

  const handleActive = () => {
    setIsActive(!isActive)
    if (isActive) {
      dispatch(removeFilter(filterId))
    } else {
      dispatch(addFilter(filterId))
    }
	}

  return (
    <button
      className={`filter-btn font-GrotMed text-color-3 text-sm tracking-tight ${isActive && 'active'}`}
      onMouseUp={handleActive}
      ref={buttonRef}
    >
      {children}
      <span className="text-lg ml-1 mb-[2px] hidden">
        <IoClose />
      </span>
    </button>
  )
}

export default Filter
