



// Missed 7
// Bad  1

const daySummarize = {
  date: "2024-09-16",
  totalOrders: 1,
  totalRevenue: 225,
  totalDiscounts: 195,
  totalDeliveryFees: 5,
  averageOrderValue: 225,
  paymentMethods: {
    CASH: 1,
  },
  customerLocations: {
    mostFrequent: {
      area: "شارع المدبح",
      coordinates: [29.61956824954226, 31.255798654718685],
      totalOrders: 1,
    },
    topDeliveryAreas: [
      {
        area: "شارع المدبح",
        totalOrders: 1,
      },
    ],
  },
  topSellingItems: [
    {
      itemId: "0eb45bf8-4979-4188-bf57-b24fe8f9048b",
      itemName: "Item Name", // Missed
      quantitySold: 1,
    },
    {
      itemId: "fa046103-953d-4f50-bc5e-421a82472e28",
      itemName: "Item Name", // Missed
      quantitySold: 1,
    },
    {
      itemId: "8b3a980d-bce0-405c-97cc-9710c4222804",
      itemName: "Item Name", // Missed
      quantitySold: 1,
    },
  ],
  peakOrderTime: "13:00 - 14:00", // Missed
  averageOrderProcessingTime: "25 minutes", // Missed
  orderStatusDistribution: {
    COMPLETED: 1,
  },
  discountCodeUsage: { // Bad
    "FIXED-200": 1,
  },
  operationalEfficiency: {
    averageCookingTime: "15 minutes", // Missed
    averageDeliveryTime: "10 minutes", // Missed
  },
  customerFeedback: {
    comments: 0, // Missed
    averageRating: 4.2, // Missed
  },
};



const monthlySummarize = {
  month: "2024-09",
  totalOrders: 250,  // Sum of all orders across 30 days
  totalRevenue: 56250,  // Sum of all revenues
  totalDiscounts: 5850,  // Sum of all discounts
  totalDeliveryFees: 1250,  // Sum of all delivery fees
  averageOrderValue: 225,  // Total revenue / total orders
  paymentMethods: {
    CASH: 150,  // Count of payments made with cash
    CARD: 100,  // Count of payments made with card
  },
  customerLocations: {
    mostFrequent: {
      area: "شارع المدبح",
      coordinates: [29.61956824954226, 31.255798654718685],
      totalOrders: 75,  // Area with the most orders across the month
    },
    topDeliveryAreas: [
      {
        area: "شارع المدبح",
        totalOrders: 75,
      },
      {
        area: "شارع النصر",
        totalOrders: 50,
      },
      {
        area: "شارع القصر",
        totalOrders: 40,
      }
    ],
  },
  topSellingItems: [
    {
      itemId: "fa046103-953d-4f50-bc5e-421a82472e28",
      itemName: "Burger",
      quantitySold: 180,  // Total quantity sold over the month
    },
    {
      itemId: "8b3a980d-bce0-405c-97cc-9710c4222804",
      itemName: "Pizza",
      quantitySold: 150,
    },
    {
      itemId: "0eb45bf8-4979-4188-bf57-b24fe8f9048b",
      itemName: "Fries",
      quantitySold: 120,
    }
  ],
  peakOrderTime: "12:00 - 14:00",  // Aggregated peak time for the month
  averageOrderProcessingTime: "22 minutes",  // Average time across 30 days
  orderStatusDistribution: {
    COMPLETED: 240,  // Total completed orders
    CANCELLED: 10,   // Total cancelled orders
  },
  discountCodeUsage: {
    "FIXED-200": 20,  // Count of how often discount codes were used
    "SUMMER25": 15,
  },
  operationalEfficiency: {
    averageCookingTime: "13 minutes",  // Average cooking time across 30 days
    averageDeliveryTime: "9 minutes",  // Average delivery time across 30 days
  },
  customerFeedback: {
    comments: 50,  // Total customer feedback comments
    averageRating: 4.3,  // Average rating across all feedback
  },
};


const myJson = {
  "comment": "",
  "user": {
      "uid": "sCTMFHNWTqcYIAn4bdwR1sZSZxL2",
      "name": "Ahmed Nasser",
      "phone": "01117073085",
      "secondPhone": ""
  },
  "location": {
      "latlng": [
          29.61956824954226,
          31.255798654718685
      ],
      "address": "شارع المدبح"
  },
  "payment": {
      "method": "CASH"
  },
  "assign": {
      "driver": null,
      "cook": null,
      "status": "pickup",
      "cancelAutoAssign": false,
      "driverStartAt": null,
      "cookStartAt": null
  },
  "cart": [
      {
          "id": "eaa3a74f-6b8e-49f7-bc3c-7e1f22cc6774",
          "quantity": 1,
          "selectedSize": null
      }
  ]
}


const order = {
  id: "6799-1725981936945",
  timestamp: 1725981936945,
  cancelAutoAssign: false,
  status: {
    current: "delivered",
    history: [
      { status: "received", timestamp: 1725981936945 },
      { status: "preparing", timestamp: 1725982936945 },
      { status: "readyForPickup", timestamp: 1725983936945 },
      { status: "enRoute", timestamp: 1725984936945 },
      { status: "delivered", timestamp: 1725985936945 }
    ]
  },
  orderTimestamps: {
    placedAt: 1725981936945,
    cookedAt: 1725982936945,
    pickedUpAt: 1725983936945,
    deliveredAt: 1725985936945
  },
  delivery: {
    driver: "Driver123",
    status: "delivered",
    estimatedTime: 1725985936945,
    driverLocation: [29.619568, 31.255799]
  },
  cart: [
    {
      id: "fa046103-953d-4f50-bc5e-421a82472e28",
      quantity: 1,
      selectedSize: "M",
      note: "",
      discountCode: "FIXED-200",
      toppings: [
        { type: "extraCheese", enabled: true },
        { type: "removeOnions", enabled: false }
      ],
    }
  ],
  cartTotalPrice: {
    total: 225,
    discount: 30,
    orderLevelDiscount: "SUMMER25"
  },
  deliveryFees: 5,
  payment: {
    method: "CASH",
    transactionId: null,
    status: "COMPLETED",
    processingFees: 0
  },
  location: {
    latlng: [29.61956824954226, 31.255798654718685],
    address: "شارع المدبح"
  },
  customer: {
    uid: "sCTMFHNWTqcYIAn4bdwR1sZSZxL2",
    name: "Ahmed Nasser",
    phone: "01117073085",
    firstOrderDate: 1715981936945,
    totalOrders: 15,
    loyaltyPoints: 200
  },
  customerFeedback: {
    rating: 4.5,
    comment: "The food was good, but delivery was a bit late."
  },
  orderSource: "mobile_app"
};




 // Missed 6
const cartItem = {
  id: "fa046103-953d-4f50-bc5e-421a82472e28",
  quantity: 1,
  selectedSize: "M",
  note: "",
  discountCode: "FIXED-200",
  toppings: [
    { type: "extraCheese", enabled: true },
    { type: "removeOnions", enabled: false }
  ],
}