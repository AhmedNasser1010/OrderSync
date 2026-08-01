import type { BusinessDocument } from "@ordersync/types";

export type RestaurantDocument = BusinessDocument & {
  metadata?: string[];
  business?: {
    contactNumbers?: string[];
  };
};
