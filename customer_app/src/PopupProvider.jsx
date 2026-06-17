import FeedbackPopup from "./components/popup_components/FeedbackPopup"
import OrderCancellationNotice from "./components/popup_components/OrderCancellationNotice"
import RestaurantUnavailablePopup from "./components/popup_components/RestaurantUnavailablePopup"

function PopupProvider({ children })  {
  return (
    <>
      <FeedbackPopup />
      <OrderCancellationNotice />
      <RestaurantUnavailablePopup />
      {children}
    </>
  )
}

export default PopupProvider
