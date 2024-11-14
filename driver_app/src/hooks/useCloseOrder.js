import { doc, writeBatch, increment } from "firebase/firestore";
import { useSelector } from "react-redux";
import { db } from "../firebase";

export default function useCloseOrder() {
  const user = useSelector((state) => state.user);
  const queue = useSelector((state) => state.queue);

  const closeOrder = async (id, callback) => {
    try {
      if (!id) {
        throw new Error("Order ID is required.");
      }
      if (!user.accessToken) {
        throw new Error("Cannot find user accessToken.");
      }

      const orderData = queue.find((order) => order.id === id);
      if (!orderData) {
        throw new Error(`Cannot find order with id "${id}"`);
      }

      const openQueueRef = doc(
        db,
        "orders",
        user.accessToken,
        "openQueue",
        `${id}_${orderData.customer.uid}`
      );
      const completedOrdersDocRef = doc(
        db,
        "orders",
        user.accessToken,
        "completedOrders",
        `${id}_${orderData.customer.uid}`
      );
      const driverRef = doc(db, "drivers", user.uid);
      const batch = writeBatch(db);

      const currentData = Date.now();
      const updatedOrderData = {
        ...orderData,
        orderTimestamps: {
          ...orderData.orderTimestamps,
          deliveredAt: currentData,
        },
        status: {
          current: "DELIVERED",
          history: [
            ...orderData.status.history,
            {
              status: "DELIVERED",
              timestamp: currentData,
            },
          ],
        },
      };

      batch.set(completedOrdersDocRef, updatedOrderData);
      batch.delete(openQueueRef);
      batch.update(driverRef, {
        ["ordersDues"]: increment(orderData.cartTotalPrice.discount),
      });

      await batch.commit();

      callback();
    } catch (error) {
      console.error("Error while close an order: ", error);
    }
  };

  return closeOrder;
}
