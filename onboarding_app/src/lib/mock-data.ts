export interface DayHours {
  day:
    | "Sunday"
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday";
  openTime: string;
  closeTime: string;
  closed: boolean;
}

export interface Restaurant {
  id: string;
  owner: {
    name: string;
    email: string;
    phone: string;
    userId: string;
  };
  info: {
    name: string;
    arabicName: string;
    iconUrl: string;
    coverUrl: string;
    industry: "restaurant" | "coffee-shop";
    cuisines: string[];
    address: {
      latitude: number;
      longitude: number;
    };
  };
  hours: DayHours[];
  cookTime: {
    min: number;
    max: number;
  };
  settings: {
    assignOrdersToCook: boolean;
    assignOrdersToDelivery: boolean;
    automaticDeliveryAssignment: boolean;
    printInvoice: boolean;
  };
  contact: {
    phoneNumbers: string[];
  };
  additional: {
    promotionalSubtitle: string;
    closeMessage: string;
  };
  status: "open" | "closed";
  lastUpdated: string;
}

const defaultHours: DayHours[] = [
  { day: "Sunday", openTime: "10:00", closeTime: "22:00", closed: false },
  { day: "Monday", openTime: "10:00", closeTime: "23:00", closed: false },
  { day: "Tuesday", openTime: "10:00", closeTime: "23:00", closed: false },
  { day: "Wednesday", openTime: "10:00", closeTime: "23:00", closed: false },
  { day: "Thursday", openTime: "10:00", closeTime: "23:00", closed: false },
  { day: "Friday", openTime: "11:00", closeTime: "00:00", closed: false },
  { day: "Saturday", openTime: "11:00", closeTime: "00:00", closed: false },
];

export const mockRestaurants: Restaurant[] = [
  {
    id: "1",
    owner: {
      name: "Ahmed Hassan",
      email: "ahmed@example.com",
      phone: "+966501234567",
      userId: "user_1",
    },
    info: {
      name: "Spice House",
      arabicName: "بيت التوابل",
      iconUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=spice",
      coverUrl:
        "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800",
      industry: "restaurant",
      cuisines: ["Indian", "Middle Eastern"],
      address: {
        latitude: 24.7136,
        longitude: 46.6753,
      },
    },
    hours: defaultHours,
    cookTime: { min: 15, max: 45 },
    settings: {
      assignOrdersToCook: true,
      assignOrdersToDelivery: true,
      automaticDeliveryAssignment: false,
      printInvoice: true,
    },
    contact: {
      phoneNumbers: ["+966501234567", "+966502345678"],
    },
    additional: {
      promotionalSubtitle: "Authentic spices from the East",
      closeMessage: "Thank you for visiting. We are closed now.",
    },
    status: "open",
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    owner: {
      name: "Fatima Al-Zahra",
      email: "fatima@example.com",
      phone: "+966503456789",
      userId: "user_2",
    },
    info: {
      name: "Coffee Chronicles",
      arabicName: "سجلات القهوة",
      iconUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=coffee",
      coverUrl:
        "https://images.unsplash.com/photo-1495474472645-4c60afe314ae?w=800",
      industry: "coffee-shop",
      cuisines: ["Specialty Coffee", "Pastries"],
      address: {
        latitude: 24.765,
        longitude: 46.711,
      },
    },
    hours: [
      { day: "Sunday", openTime: "07:00", closeTime: "20:00", closed: false },
      { day: "Monday", openTime: "07:00", closeTime: "21:00", closed: false },
      { day: "Tuesday", openTime: "07:00", closeTime: "21:00", closed: false },
      {
        day: "Wednesday",
        openTime: "07:00",
        closeTime: "21:00",
        closed: false,
      },
      { day: "Thursday", openTime: "07:00", closeTime: "21:00", closed: false },
      { day: "Friday", openTime: "08:00", closeTime: "20:00", closed: false },
      { day: "Saturday", openTime: "08:00", closeTime: "20:00", closed: false },
    ],
    cookTime: { min: 5, max: 15 },
    settings: {
      assignOrdersToCook: false,
      assignOrdersToDelivery: false,
      automaticDeliveryAssignment: false,
      printInvoice: false,
    },
    contact: {
      phoneNumbers: ["+966503456789"],
    },
    additional: {
      promotionalSubtitle: "Premium coffee experience",
      closeMessage: "See you tomorrow!",
    },
    status: "open",
    lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    owner: {
      name: "Mohammed Ali",
      email: "mohammed@example.com",
      phone: "+966504567890",
      userId: "user_3",
    },
    info: {
      name: "Burger Station",
      arabicName: "محطة الهمبرجر",
      iconUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=burger",
      coverUrl:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
      industry: "restaurant",
      cuisines: ["Fast Food", "American"],
      address: {
        latitude: 24.756,
        longitude: 46.702,
      },
    },
    hours: defaultHours,
    cookTime: { min: 10, max: 30 },
    settings: {
      assignOrdersToCook: true,
      assignOrdersToDelivery: true,
      automaticDeliveryAssignment: true,
      printInvoice: true,
    },
    contact: {
      phoneNumbers: ["+966504567890", "+966505678901", "+966506789012"],
    },
    additional: {
      promotionalSubtitle: "Best burgers in town",
      closeMessage: "We are closed. Please try again later.",
    },
    status: "closed",
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];
