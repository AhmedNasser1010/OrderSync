import type { BusinessDocument } from "@ordersync/types";

export type RestaurantDocument = BusinessDocument & {
  business?: {
    contactNumbers?: string[];
  };
};
