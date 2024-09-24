import FeedbackPopup from "./components/popup_components/FeedbackPopup"
import OrderCanceledNotice from "./components/popup_components/OrderCanceledNotice"

function PopupProvider({ children })  {
  return (
    <>
      <FeedbackPopup />
      <OrderCanceledNotice />
      {children}
    </>
  )
}

export default PopupProvider