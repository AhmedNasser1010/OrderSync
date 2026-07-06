export type CategoryType = {
  id: string;
  title: string;
  description?: string;
  topMenu: boolean;
  visibility: boolean;
  backgrounds: string[];
  createdAt: number;
  updatedAt: number;
};

export type SizeType = {
  size: string;
  price: string;
};

export type ItemType = {
  id: string;
  title: string;
  description?: string;
  price: number;
  topMenu: boolean;
  visibility: boolean;
  category: string;
  backgrounds: string[];
  sizes?: SizeType[];
  createdAt: number;
  updatedAt: number;
};

export type MainMenuType = {
  accessToken: string;
  partnerUid: string;
  createdAt: number;
  updatedAt: number;
  categories: CategoryType[];
  items: ItemType[];
};
