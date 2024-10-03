import FeedbackPopup from "./components/popup_components/FeedbackPopup"
import OrderCancellationNotice from "./components/popup_components/OrderCancellationNotice"

function PopupProvider({ children })  {
  return (
    <>
      <FeedbackPopup />
      <OrderCancellationNotice />
      {children}
    </>
  )
}

export default PopupProvider