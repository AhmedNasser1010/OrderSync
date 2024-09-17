import { Order } from '@/types/order'

type DaySummary = {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalDiscounts: number;
  totalDeliveryFees: number;
  averageOrderValue: number;
  paymentMethods: Record<string, number>;
  customerLocations: {
    mostFrequent: {
      area: string;
      coordinates: [number, number];
      totalOrders: number;
    };
    topDeliveryAreas: {
      area: string;
      totalOrders: number;
    }[];
  };
  topSellingItems: {
    itemId: string;
    itemName: string;
    quantitySold: number;
  }[];
  peakOrderTime: string;
  averageOrderProcessingTime: string;
  orderStatusDistribution: Record<string, number>;
  discountCodeUsage: Record<string, number>;
  operationalEfficiency: {
    averageCookingTime: string;
    averageDeliveryTime: string;
  };
  customerFeedback: {
    comments: number;
    averageRating: number;
  };
};

// Helper functions (for simplicity)
const getTimeRange = (orders: Order[]) => "13:00 - 14:00"; // Stub for peak time calculation
const getOrderProcessingTime = (orders: Order[]) => "25 minutes"; // Stub for average processing time
const getCookingTime = (orders: Order[]) => "15 minutes"; // Stub for average cooking time
const getDeliveryTime = (orders: Order[]) => "10 minutes"; // Stub for average delivery time

function summarizeOrders(orders: Order[]): DaySummary {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.cartTotalPrice.total, 0);
  const totalDiscounts = orders.reduce((sum, order) => sum + order.cartTotalPrice.discount, 0);
  const totalDeliveryFees = orders.reduce((sum, order) => sum + order.deliveryFees, 0);
  const paymentMethods = orders.reduce((methods: Record<string, number>, order) => {
    methods[order.payment.method] = (methods[order.payment.method] || 0) + 1;
    return methods;
  }, {});
  const customerLocations = getTopDeliveryAreas(orders);
  const topSellingItems = getTopSellingItems(orders);
  const orderStatusDistribution = orders.reduce((distribution: Record<string, number>, order) => {
    distribution[order.status] = (distribution[order.status] || 0) + 1;
    return distribution;
  }, {});
  const discountCodeUsage = orders.reduce((usage: Record<string, number>, order) => {
    order.cart.forEach(item => {
      if (item.discountCode) {
        usage[item.discountCode] = (usage[item.discountCode] || 0) + 1;
      }
    });
    return usage;
  }, {});
  const comments = orders.filter(order => order.comment !== "").length;

  return {
    date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    totalOrders,
    totalRevenue,
    totalDiscounts,
    totalDeliveryFees,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    paymentMethods,
    customerLocations,
    topSellingItems,
    peakOrderTime: getTimeRange(orders),
    averageOrderProcessingTime: getOrderProcessingTime(orders),
    orderStatusDistribution,
    discountCodeUsage,
    operationalEfficiency: {
      averageCookingTime: getCookingTime(orders),
      averageDeliveryTime: getDeliveryTime(orders),
    },
    customerFeedback: {
      comments,
      averageRating: 4.2 // Stub value for customer ratings
    }
  };
}

// Helper function to extract top delivery areas
function getTopDeliveryAreas(orders: Order[]) {
  const areaMap: Record<string, { coordinates: [number, number]; totalOrders: number }> = {};
  
  orders.forEach(order => {
    const area = order.location.address;
    if (!areaMap[area]) {
      areaMap[area] = { coordinates: order.location.latlng, totalOrders: 0 };
    }
    areaMap[area].totalOrders += 1;
  });
  
  const areas = Object.entries(areaMap).map(([area, data]) => ({
    area,
    totalOrders: data.totalOrders
  }));

  areas.sort((a, b) => b.totalOrders - a.totalOrders);

  return {
    mostFrequent: {
      area: areas[0].area,
      coordinates: areaMap[areas[0].area].coordinates,
      totalOrders: areas[0].totalOrders
    },
    topDeliveryAreas: areas.slice(0, 5)
  };
}

// Helper function to extract top selling items
function getTopSellingItems(orders: Order[]) {
  const itemMap: Record<string, { itemName: string; quantitySold: number }> = {};
  
  orders.forEach(order => {
    order.cart.forEach(item => {
      const itemId = item.id;
      const itemName = "Item Name"; // Stub: Replace with real item name lookup
      if (!itemMap[itemId]) {
        itemMap[itemId] = { itemName, quantitySold: 0 };
      }
      itemMap[itemId].quantitySold += item.quantity;
    });
  });

  const items = Object.entries(itemMap).map(([itemId, data]) => ({
    itemId,
    itemName: data.itemName,
    quantitySold: data.quantitySold
  }));

  items.sort((a, b) => b.quantitySold - a.quantitySold);

  return items.slice(0, 5); // Return top 5 selling items
}

export default summarizeOrders