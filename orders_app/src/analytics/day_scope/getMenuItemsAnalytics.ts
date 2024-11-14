import { OrderType } from "@/types/order";
import { ItemType } from "@/types/menu";

export default function getMenuItemsAnalytics(
  orders: OrderType[],
  menuItems: ItemType[]
) {
  const menuItemAnalytics = menuItems.reduce((acc, item) => {
    acc[item.id] = {
      title: item.title,
      category: item.category,
      totalQuantitySold: 0,
      totalRevenue: 0,
      totalDiscountsSave: 0,
    };
    return acc;
  }, {} as Record<string, { title: string; category: string; totalQuantitySold: number; totalRevenue: number; totalDiscountsSave: number }>);

  orders.forEach((order) => {
    const totalDiscountsSave =
      (order.cartTotalPrice?.total || 0) -
      (order.cartTotalPrice?.discount || 0);

    const totalItemsInCart = order.cart.reduce(
      (acc, cartItem) => acc + cartItem.quantity,
      0
    );

    order.cart.forEach((cartItem) => {
      const itemAnalytics = menuItemAnalytics[cartItem.id];
      if (itemAnalytics) {
        const item = menuItems.find((menuItem) => menuItem.id === cartItem.id);
        const itemPrice =
          item && typeof item.price === "string" ? parseFloat(item.price) : 0;

        itemAnalytics.totalQuantitySold += cartItem.quantity;
        itemAnalytics.totalRevenue += cartItem.quantity * itemPrice;

        const discountSavePerItem =
          totalDiscountsSave * (cartItem.quantity / totalItemsInCart);
        itemAnalytics.totalDiscountsSave += discountSavePerItem;
      }
    });
  });

  const report = Object.values(menuItemAnalytics).filter(
    (item) =>
      item.totalQuantitySold > 0 ||
      item.totalRevenue > 0 ||
      item.totalDiscountsSave > 0
  );

  return report;
}
