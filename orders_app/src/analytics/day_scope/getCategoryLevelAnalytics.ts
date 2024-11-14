import { OrderType } from "@/types/order";
import { ItemType, CategoryType } from "@/types/menu";

export default function getCategoryLevelAnalytics(
  orders: OrderType[],
  menuItems: ItemType[],
  categories: CategoryType[]
) {
  const categoryAnalytics = categories.reduce((acc, category) => {
    acc[category.id] = {
      title: category.title,
      totalQuantitySold: 0,
      totalRevenue: 0,
      totalDiscountsSave: 0,
    };
    return acc;
  }, {} as Record<string, { title: string; totalQuantitySold: number; totalRevenue: number; totalDiscountsSave: number }>);

  const itemToCategoryMap = menuItems.reduce((acc, item) => {
    if (item.category && categoryAnalytics[item.category]) {
      acc[item.id] = item.category;
    }
    return acc;
  }, {} as Record<string, string>);

  orders.forEach((order) => {
    const totalDiscountsSave =
      (order.cartTotalPrice?.total || 0) -
      (order.cartTotalPrice?.discount || 0);

    const totalItemsInCart = order.cart.reduce(
      (acc, cartItem) => acc + cartItem.quantity,
      0
    );

    order.cart.forEach((cartItem) => {
      const categoryId = itemToCategoryMap[cartItem.id];
      if (categoryId && categoryAnalytics[categoryId]) {
        const category = categoryAnalytics[categoryId];

        const item = menuItems.find((menuItem) => menuItem.id === cartItem.id);
        const itemPrice =
          item && typeof item.price === "string" ? parseFloat(item.price) : 0;

        category.totalQuantitySold += cartItem.quantity;
        category.totalRevenue += cartItem.quantity * itemPrice;

        const discountSavePerItem =
          totalDiscountsSave * (cartItem.quantity / totalItemsInCart);
        category.totalDiscountsSave += discountSavePerItem;
      }
    });
  });

  const report = Object.values(categoryAnalytics).filter(
    (category) =>
      category.totalQuantitySold > 0 ||
      category.totalRevenue > 0 ||
      category.totalDiscountsSave > 0
  );

  return report;
}
