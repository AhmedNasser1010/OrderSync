import { useEffect } from "react";
import { useSelector } from "react-redux";
import pushNotify from "../functions/pushNotify";

const useOrdersNotificationSub = () => {
  const menuItems = useSelector((state) => state.menu.items);
  const orders = useSelector((state) => state.orders.open);

  useEffect(() => {
    orders?.map((order) => {
      if (order?.status === "RECEIVED") {
        const menuItem = order.cart.map((cart) =>
          menuItems.find((item) => item.id === cart.id)
        );

        const cartItems = menuItem.map((item) => item.title);

        const nMsg = `*
رقم الاوردر: ${order?.id.split("-")[0]}
العناصر:
${cartItems.map((item, index) => `${index+1}- ${item}`).join("\n")}
`;

        pushNotify({
          title: "لقد تم استلام طلب جديد.",
          body: nMsg,
          tag: order?.id,
          repeated: true,
          repeatedMillisecond: 20000
        });
      }
    });
  }, [orders]);

  return null;
};

export default useOrdersNotificationSub;
