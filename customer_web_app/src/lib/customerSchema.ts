interface CustomerSchemaArgs {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  referredBy?: string;
  avatar?: string;
  provider: string;
}

const customerSchema = ({
  uid,
  name,
  email,
  phone,
  referredBy,
  avatar,
  provider,
}: CustomerSchemaArgs) => {
  return {
    partnerUid: process.env.NEXT_PUBLIC_PARTNER_ID || null,
    uid,
    createdAt: Date.now(),
    isActive: true,
    restaurants: [],
    locations: {
      home: {
        latlng: [0, 0],
        address: "",
      },
      selected: "home",
      city: "El Ayat",
    },
    userInfo: {
      role: "CUSTOMER",
      name: name || "",
      email: email || "",
      phone: phone || "",
      secondPhone: "",
      avatar: avatar || "",
      uid,
      provider,
    },
    referral: {
      successReferred: [],
      referredBy: referredBy || "",
      isFirstOrder: true,
    },
    trackedOrder: {
      id: null,
      orderNumber: null,
      restaurant: null,
      loyaltyCountedForOrderId: null,
      pendingLoyalty: null,
    },
  };
};

export default customerSchema;
