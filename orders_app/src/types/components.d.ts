export type MainTabTypes = "RECEIVED" | "PREPARING" | "DELIVERY" | "COMPLETED" | "VOIDED";

export type FormattedDriverForAssignCard = {
  id: string;
  name: string;
  avatar: string;
  ordersDues: number;
  status: string;
};