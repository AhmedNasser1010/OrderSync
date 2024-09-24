import { IoIosClose } from "react-icons/io"

function PopupHeader({ children, className, closePopupCallback }) {
  return (
    <div className={`popup-header relative text-center border-gray-200 pb-4 ${className}`}>
      <IoIosClose className='absolute -top-1 -right-2 cursor-pointer text-3xl' onClick={closePopupCallback} />
      {children}
    </div>
  )
}

export default PopupHeader