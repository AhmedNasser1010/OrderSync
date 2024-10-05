const fakeOrder = {
  location: {
    address: "شارع المدبح",
    latlng: [29.606764728989337, 31.250321618072824],
  },
  delivery: {
    uid: null,
    status: "PENDING",
    name: null,
    phone: null,
    liveLocation: [0, 0],
  },
  cartTotalPrice: {
    discount: 96,
    total: 96,
  },
  customerFeedback: {
    comment: null,
    rating: null,
  },
  timestamp: 1728055318719,
  orderNote: "",
  orderSource: "pc_chrome",
  id: "6920-1728055318720",
  cancelAutoAssign: false,
  payment: {
    method: "CASH",
    status: "COMPLETED",
  },
  customer: {
    name: "احمد ناصر",
    firstOrderDate: 1725581343213,
    phone: "01117073085",
    uid: "sCTMFHNWTqcYIAn4bdwR1sZSZxL2",
    totalOrders: 9,
    secondPhone: "",
    totalOrdersValue: 880,
  },
  orderTimestamps: {
    placedAt: 1728055318719,
    preparedAt: 1728055356667,
    deliveredAt: null,
    pickedUpAt: null,
    deliveryAt: 1728157089688,
  },
  status: {
    accepted: true,
    history: [
      {
        status: "RECEIVED",
        timestamp: 1728055318719,
      },
      {
        status: "PREPARING",
        timestamp: 1728055356666,
      },
      {
        status: "DELIVERY",
        timestamp: 1728157089688,
      },
    ],
    current: "DELIVERY",
  },
  accessToken: "4d10754c-0a04-492c-9f41-df7ed0ca580e",
  cart: [
    {
      id: "fcc89715-5abb-47e3-8fd3-df1a512a140b",
      quantity: 1,
    },
  ],
  deliveryFees: 6,
};

export default fakeOrder;
