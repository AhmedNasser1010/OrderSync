// Type for Background URLs
export type BackgroundType = string[];

// Type for a Menu Category
export type CategoryType = {
  id: string;
  title: string;
  description: string;
  topMenu: boolean;
  timestamp: number;
  visibility: boolean;
  backgrounds: BackgroundType;
};

// Type for a Menu Item Size
export type SizeType = {
  size: string;
  price: string;
};

// Type for a Menu Item
export type ItemType = {
  id: string;
  title: string;
  description: string;
  price: string | number;
  topMenu: boolean;
  visibility: boolean;
  category: string; // Reference to Category by ID
  timestamp: number;
  backgrounds: BackgroundType;
  sizes: SizeType[];
  quantity?: number;
  selectedSize?: 'S' | 'M' | 'L';
};

// Main Menu Type
export type MainMenuType = {
  accessToken: string;
  categories: CategoryType[];
  items: ItemType[];
};
