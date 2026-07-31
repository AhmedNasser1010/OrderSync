import type { OrderType, MainMenuType, ItemType } from "@ordersync/types";
import type { AnalyticsEntry } from "@/lib/types/AnalyticsEntry";

function dayKey(ts: number): string {
  const d = new Date(ts);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function resolveItemPrice(item?: ItemType): number {
  if (!item) return 0;
  return typeof item.price === "number"
    ? item.price
    : parseFloat(item.price) || 0;
}

type ItemAgg = {
  title: string;
  category: string;
  quantity: number;
  revenue: number;
  discountSave: number;
};

type CategoryAgg = {
  quantity: number;
  revenue: number;
  discountSave: number;
};

const buildAnalyticsFromOrders = (
  orders: OrderType[],
  menu?: MainMenuType,
): AnalyticsEntry[] => {
  if (!orders.length) return [];

  const itemPrices = new Map<string, number>();
  const itemTitles = new Map<string, string>();
  const itemToCategory = new Map<string, string>();
  const categoryTitles = new Map<string, string>();

  menu?.items.forEach((item) => {
    itemPrices.set(item.id, resolveItemPrice(item));
    itemTitles.set(item.id, item.title);
    if (item.category && menu.categories.some((c) => c.id === item.category)) {
      itemToCategory.set(item.id, item.category);
    }
  });
  menu?.categories.forEach((category) => {
    categoryTitles.set(category.id, category.title);
  });

  const grouped = new Map<string, OrderType[]>();
  for (const order of orders) {
    const key = dayKey(order.createdAt);
    const dayOrders = grouped.get(key);
    if (dayOrders) dayOrders.push(order);
    else grouped.set(key, [order]);
  }

  const entries: AnalyticsEntry[] = [];

  for (const [businessDate, dayOrders] of grouped) {
    let totalOrders = 0;
    let totalRevenue = 0;
    let totalDiscounts = 0;
    let totalDeliveryFees = 0;
    let totalCancelled = 0;
    let totalOrderValue = 0;
    let createdAt = Infinity;

    const preparationTimes: number[] = [];
    const deliveryTimes: number[] = [];
    const completionTimes: number[] = [];

    const uniqueCustomers = new Set<string>();
    let newCustomers = 0;
    let returningCustomers = 0;
    let totalRatings = 0;
    let feedbackCount = 0;

    const paymentMethods: Record<string, number> = {};
    const orderSources: Record<string, number> = {};
    const locationCounts: Record<
      string,
      { address: string; latlng: [number, number]; ordersCount: number }
    > = {};
    let highestValueCustomer = {
      name: "",
      totalOrdersValue: 0,
      totalOrderCount: 0,
    };

    const itemAnalytics = new Map<string, ItemAgg>();
    const categoryAnalytics = new Map<string, CategoryAgg>();

    for (const order of dayOrders) {
      totalOrders++;
      totalRevenue += order.pricing.total;
      totalDiscounts += order.pricing.discount;
      totalDeliveryFees += order.pricing.deliveryFees;
      totalOrderValue += order.pricing.total;
      if (order.createdAt < createdAt) createdAt = order.createdAt;

      if (order.timeline.preparingAt && order.timeline.placedAt) {
        preparationTimes.push(order.timeline.preparingAt - order.timeline.placedAt);
      }
      if (order.timeline.deliveredAt && order.timeline.preparingAt) {
        completionTimes.push(order.timeline.deliveredAt - order.timeline.preparingAt);
      }
      if (order.timeline.deliveredAt && order.timeline.placedAt) {
        deliveryTimes.push(order.timeline.deliveredAt - order.timeline.placedAt);
      }

      if (!uniqueCustomers.has(order.customer.uid)) {
        uniqueCustomers.add(order.customer.uid);
        if (order.customer.totalOrders === 1) newCustomers++;
        else returningCustomers++;
      }
      if (order.customerFeedback?.rating) {
        totalRatings += order.customerFeedback.rating;
        feedbackCount++;
      }

      paymentMethods[order.payment.method] =
        (paymentMethods[order.payment.method] || 0) + 1;
      orderSources[order.metadata.orderSource] =
        (orderSources[order.metadata.orderSource] || 0) + 1;

      const locationKey = `${order.delivery.address}:${order.delivery.latlng.join(
        ",",
      )}`;
      if (!locationCounts[locationKey]) {
        locationCounts[locationKey] = {
          address: order.delivery.address,
          latlng: order.delivery.latlng,
          ordersCount: 0,
        };
      }
      locationCounts[locationKey].ordersCount++;

      if (order.status.current === "CANCELED") totalCancelled++;

      if (order.customer.totalOrdersValue > highestValueCustomer.totalOrdersValue) {
        highestValueCustomer = {
          name: order.customer.name,
          totalOrdersValue: order.customer.totalOrdersValue,
          totalOrderCount: order.customer.totalOrders,
        };
      }

      const totalDiscountsSave =
        (order.pricing?.total || 0) - (order.pricing?.discount || 0);
      const totalItemsInCart = order.cart.reduce(
        (acc, cartItem) => acc + cartItem.quantity,
        0,
      );

      order.cart.forEach((cartItem) => {
        const price = itemPrices.get(cartItem.id) ?? 0;
        const revenue = cartItem.quantity * price;
        const discountSavePerItem =
          totalItemsInCart > 0
            ? totalDiscountsSave * (cartItem.quantity / totalItemsInCart)
            : 0;

        const existingItem = itemAnalytics.get(cartItem.id);
        if (existingItem) {
          existingItem.quantity += cartItem.quantity;
          existingItem.revenue += revenue;
          existingItem.discountSave += discountSavePerItem;
        } else {
          itemAnalytics.set(cartItem.id, {
            title: itemTitles.get(cartItem.id) ?? cartItem.name,
            category: categoryTitles.get(itemToCategory.get(cartItem.id) ?? "") ?? "",
            quantity: cartItem.quantity,
            revenue,
            discountSave: discountSavePerItem,
          });
        }

        const categoryId = itemToCategory.get(cartItem.id);
        if (categoryId) {
          const existingCategory = categoryAnalytics.get(categoryId);
          if (existingCategory) {
            existingCategory.quantity += cartItem.quantity;
            existingCategory.revenue += revenue;
            existingCategory.discountSave += discountSavePerItem;
          } else {
            categoryAnalytics.set(categoryId, {
              quantity: cartItem.quantity,
              revenue,
              discountSave: discountSavePerItem,
            });
          }
        }
      });
    }

    const itemsAnalytics = [...itemAnalytics.values()].map((item) => ({
      title: item.title,
      category: item.category,
      totalQuantitySold: item.quantity,
      totalRevenue: item.revenue,
      totalDiscountsSave: item.discountSave,
    }));

    const categoriesAnalytics = [...categoryAnalytics.entries()].map(
      ([categoryId, category]) => ({
        title: categoryTitles.get(categoryId) ?? "",
        totalQuantitySold: category.quantity,
        totalRevenue: category.revenue,
        totalDiscountsSave: category.discountSave,
      }),
    );

    const topLocations = Object.values(locationCounts).sort(
      (a, b) => b.ordersCount - a.ordersCount,
    );

    const averageOrderValue =
      totalOrders > 0 ? Number((totalOrderValue / totalOrders).toFixed(2)) : 0;

    const cancellationRate =
      totalOrders > 0 ? (totalCancelled / totalOrders) * 100 : 0;

    entries.push({
      businessId: dayOrders[0]?.businessId ?? "",
      businessDate,
      createdAt: createdAt === Infinity ? 0 : createdAt,
      totalOrders,
      totalRevenue,
      totalDiscounts,
      totalDeliveryFees,
      orderSources,
      paymentMethods,
      revenuePerCustomer: {
        highestValueCustomer,
        averageOrderValue,
      },
      orderDurations: {
        averagePreparationTime: average(preparationTimes),
        averageDeliveryTime: average(deliveryTimes),
        averageCompletionTime: average(completionTimes),
      },
      customerInsights: {
        totalUniqueCustomers: uniqueCustomers.size,
        newCustomers,
        returningCustomers,
        averageRating: feedbackCount > 0 ? totalRatings / feedbackCount : 0,
        feedbackCount,
      },
      cancelledOrders: {
        totalCancelled,
        cancellationRate,
      },
      categoriesAnalytics,
      itemsAnalytics,
      topLocations,
    });
  }

  return entries.sort((a, b) => a.businessDate.localeCompare(b.businessDate));
};

export default buildAnalyticsFromOrders;
