export interface BannerCta {
  labelEn: string;
  labelAr: string;
  href: string;
  openInNewTab?: boolean;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
}

export interface HeroBanner {
  id: string;
  imageUrl: string;
  cta: BannerCta;
  ctaPosition?: { x: number; y: number; corner: "top-left" | "top-right" | "bottom-left" | "bottom-right" };
  active: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}
