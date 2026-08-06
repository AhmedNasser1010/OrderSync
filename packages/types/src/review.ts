export type CustomerFeedbackType = {
  orderId: string;
  customerId: string;
  restaurantId: string;
  rating: number;
  comment: string;
  createdAt: number;
  updatedAt: number;
  hidden?: boolean;
  hiddenAt?: number;
  hiddenBy?: string;
};
