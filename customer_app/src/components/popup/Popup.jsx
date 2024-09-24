import PopupContent from './PopupContent'
import PopupHeader from './PopupHeader'
import PopupFooter from './PopupFooter'
import PopupTitle from './PopupTitle'
import PopupDescription from './PopupDescription'

function Popup({ children, className }) {
  return (
    <div className={`popup fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${className}`}>
      
      {children}
    </div>
  )
}

export {
  Popup,
  PopupContent,
  PopupHeader,
  PopupFooter,
  PopupTitle,
  PopupDescription
}